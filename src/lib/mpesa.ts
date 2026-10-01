import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * M-Pesa Daraja "Lipa na M-Pesa Online" (STK Push): the customer gets a
 * payment prompt on their phone, enters their PIN, and Safaricom tells us the
 * result. Configured entirely through environment variables in Vercel:
 *
 *   MPESA_ENV              sandbox | production        (default: sandbox)
 *   MPESA_CONSUMER_KEY     from your Daraja app
 *   MPESA_CONSUMER_SECRET  from your Daraja app
 *   MPESA_SHORTCODE        sandbox: 174379 · live: your PayBill / store number
 *   MPESA_PASSKEY          Lipa na M-Pesa passkey
 *   MPESA_TILL             live Buy Goods only: the Till number customers pay
 *
 * Keys never reach the browser and are never logged.
 */
const env = (k: string) => (process.env[k] ?? "").trim().replace(/^["'`]+|["'`]+$/g, "").trim();

const cfg = {
  key: env("MPESA_CONSUMER_KEY"),
  secret: env("MPESA_CONSUMER_SECRET"),
  shortcode: env("MPESA_SHORTCODE").replace(/\D/g, ""),
  passkey: env("MPESA_PASSKEY"),
  till: env("MPESA_TILL").replace(/\D/g, ""),
  live: /^prod/i.test(env("MPESA_ENV")),
};
const BASE = env("MPESA_BASE_URL") || (cfg.live ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke");

export const MPESA_ON = !!(cfg.key && cfg.secret && cfg.shortcode && cfg.passkey);
export const MPESA_MODE = cfg.live ? "live" : "sandbox";

/** 07XX…, 01XX…, +2547…, 2547… → 2547XXXXXXXX (Safaricom format), else null. */
export function normalizePhone(v: unknown): string | null {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = `254${d.slice(1)}`;
  else if (/^[71]\d{8}$/.test(d)) d = `254${d}`;
  return /^254[71]\d{8}$/.test(d) ? d : null;
}

const sign = (purpose: string, value: string) =>
  createHmac("sha256", `${cfg.secret}:${cfg.passkey}`).update(`${purpose}:${value}`).digest("hex");

/** Secret path segment for our callback URL, so nobody else can post results to it. */
export const callbackToken = () => sign("callback", cfg.shortcode).slice(0, 40);
/** Lets the customer who placed an order check its payment (no login needed). */
export const payToken = (orderId: string) => sign("pay", orderId).slice(0, 32);

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function callbackUrl(req: Request) {
  const site =
    env("SITE_URL") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : new URL(req.url).origin);
  return `${site.replace(/\/$/, "")}/api/mpesa/callback/${callbackToken()}`;
}

/** Daraja timestamp, Nairobi time: YYYYMMDDHHmmss */
function timestamp() {
  return new Date(Date.now() + 3 * 3600_000).toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

let token: { value: string; until: number } | null = null;
async function accessToken(): Promise<string> {
  if (token && Date.now() < token.until) return token.value;
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${cfg.key}:${cfg.secret}`).toString("base64")}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: string | number };
  if (!res.ok || !data.access_token) throw new Error(`M-Pesa sign-in failed (HTTP ${res.status}) — check the consumer key and secret`);
  token = { value: data.access_token, until: Date.now() + (Number(data.expires_in) || 3599) * 1000 - 60_000 };
  return token.value;
}

async function daraja<T>(path: string, body: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: T & { errorCode?: string; errorMessage?: string } }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 401) token = null;
  const data = (await res.json().catch(() => ({}))) as T & { errorCode?: string; errorMessage?: string };
  return { ok: res.ok, status: res.status, data };
}

function password(ts: string) {
  return Buffer.from(`${cfg.shortcode}${cfg.passkey}${ts}`).toString("base64");
}

/** Send the payment prompt to the customer's phone. */
export async function stkPush(p: { amount: number; phone: string; reference: string; callback: string }): Promise<
  { ok: true; checkoutRequestId: string; merchantRequestId: string; message: string } | { ok: false; error: string }
> {
  if (!MPESA_ON) return { ok: false, error: "M-Pesa prompts aren't set up" };
  try {
    const ts = timestamp();
    const r = await daraja<{ ResponseCode?: string; CheckoutRequestID?: string; MerchantRequestID?: string; CustomerMessage?: string; ResponseDescription?: string }>(
      "/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: cfg.shortcode,
        Password: password(ts),
        Timestamp: ts,
        TransactionType: cfg.till ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
        Amount: Math.max(1, Math.ceil(p.amount)),
        PartyA: p.phone,
        PartyB: cfg.till || cfg.shortcode,
        PhoneNumber: p.phone,
        CallBackURL: p.callback,
        AccountReference: p.reference.replace(/[^A-Za-z0-9-]/g, "").slice(0, 12) || "SIRVERT",
        TransactionDesc: "SIR VERT order",
      },
    );
    if (r.ok && r.data.ResponseCode === "0" && r.data.CheckoutRequestID) {
      return { ok: true, checkoutRequestId: r.data.CheckoutRequestID, merchantRequestId: r.data.MerchantRequestID ?? "", message: r.data.CustomerMessage ?? "" };
    }
    return { ok: false, error: r.data.errorMessage || r.data.ResponseDescription || `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "M-Pesa request failed" };
  }
}

/** Ask Safaricom how a prompt ended. `resultCode` null = still waiting / unknown. */
export async function stkQuery(checkoutRequestId: string): Promise<{ resultCode: number | null; resultDesc: string }> {
  if (!MPESA_ON) return { resultCode: null, resultDesc: "" };
  try {
    const ts = timestamp();
    const r = await daraja<{ ResultCode?: string | number; ResultDesc?: string }>("/mpesa/stkpushquery/v1/query", {
      BusinessShortCode: cfg.shortcode,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    });
    if (r.ok && r.data.ResultCode !== undefined && r.data.ResultCode !== "") {
      return { resultCode: Number(r.data.ResultCode), resultDesc: r.data.ResultDesc ?? "" };
    }
    return { resultCode: null, resultDesc: r.data.errorMessage ?? "" }; // e.g. "The transaction is being processed"
  } catch {
    return { resultCode: null, resultDesc: "" };
  }
}

/** Friendly wording for Safaricom result codes. */
export function stkMessage(code: number, desc = ""): string {
  if (code === 0) return "Payment received";
  if (code === 1032) return "You cancelled the M-Pesa prompt";
  if (code === 1037 || code === 1019) return "The M-Pesa prompt timed out — your phone may have been off or unreachable";
  if (code === 1) return "Your M-Pesa balance is too low for this payment";
  if (code === 2001) return "Wrong M-Pesa PIN entered";
  if (code === 1001) return "Another M-Pesa payment is in progress on this phone — wait a moment and try again";
  return desc || "The M-Pesa payment didn't go through";
}

import { NextResponse } from "next/server";
import { callbackToken, safeEqual, stkQuery } from "@/lib/mpesa";
import { settlePrompt } from "@/lib/mpesa-orders";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

type Item = { Name?: string; Value?: string | number };
const ACK = () => NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

/** POST — Safaricom tells us how an M-Pesa prompt ended. The secret token in the
 *  path proves the request uses the callback URL we gave Safaricom. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!safeEqual(token, callbackToken())) return new NextResponse("Not found", { status: 404 });

  const body = (await req.json().catch(() => null)) as { Body?: { stkCallback?: Record<string, unknown> } } | null;
  const cb = body?.Body?.stkCallback;
  const checkoutRequestId = typeof cb?.CheckoutRequestID === "string" ? cb.CheckoutRequestID : "";
  if (!cb || !checkoutRequestId) return ACK();

  const code = Number(cb.ResultCode);
  const desc = String(cb.ResultDesc ?? "").slice(0, 200);
  const items = ((cb.CallbackMetadata as { Item?: Item[] } | undefined)?.Item ?? []) as Item[];
  const meta = (name: string) => items.find((i) => i.Name === name)?.Value;

  if (code === 0) {
    // Double-check with Safaricom before marking anything paid.
    const q = await stkQuery(checkoutRequestId);
    if (q.resultCode !== null && q.resultCode !== 0) {
      await logActivity("security", "error", `M-Pesa success message did not match Safaricom's records (${q.resultDesc || q.resultCode}) — ignored`, { req });
      return ACK();
    }
  }
  await settlePrompt(
    checkoutRequestId,
    {
      code: Number.isFinite(code) ? code : -1,
      desc,
      receipt: meta("MpesaReceiptNumber") ? String(meta("MpesaReceiptNumber")).replace(/[^A-Za-z0-9]/g, "").slice(0, 20) : undefined,
      amount: Number(meta("Amount")) || undefined,
      phone: meta("PhoneNumber") ? String(meta("PhoneNumber")).replace(/\D/g, "").slice(0, 15) : undefined,
    },
    "callback",
  );
  return ACK();
}

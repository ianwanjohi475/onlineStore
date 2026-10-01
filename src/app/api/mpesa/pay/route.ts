import { NextResponse } from "next/server";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { MPESA_ON, payToken, safeEqual } from "@/lib/mpesa";
import { promptStatus, refreshPrompt, sendPrompt } from "@/lib/mpesa-orders";
import { findOrderByNumber } from "@/lib/store/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function orderFor(number: string | null, token: string | null) {
  if (!number || !token) return null;
  const order = await findOrderByNumber(number);
  return order && safeEqual(token, payToken(order.id)) ? order : null;
}

/** GET ?order=&t= — payment status for the customer who placed the order.
 *  GET (no params) — whether M-Pesa prompts are available. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (!u.searchParams.has("order")) return NextResponse.json({ enabled: MPESA_ON }, { headers: { "Cache-Control": "no-store" } });
  if (!rateLimit(`pay-status:${clientIp(req)}`, 120, 10 * 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const order = await orderFor(u.searchParams.get("order"), u.searchParams.get("t"));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promptStatus(await refreshPrompt(order)), { headers: { "Cache-Control": "no-store" } });
}

/** POST { order, t, phone } — send the M-Pesa prompt again (e.g. after a cancel). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!MPESA_ON) return NextResponse.json({ error: "M-Pesa prompts aren't available. Please pay to our Till number." }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { order?: string; t?: string; phone?: string } | null;
  const order = await orderFor(body?.order ?? null, body?.t ?? null);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!rateLimit(`pay-retry:${order.id}`, 5, 15 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes or pay to our Till number." }, { status: 429 });
  }
  if (order.stk?.status === "pending" && Date.now() - new Date(order.stk.at).getTime() < 20_000) {
    return NextResponse.json({ error: "A prompt was just sent — check your phone." }, { status: 409 });
  }
  const r = await sendPrompt(order, body?.phone ?? order.stk?.phone ?? order.customer.phone, req);
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: 400 });
  return NextResponse.json({ ...promptStatus(r.order), message: r.message });
}

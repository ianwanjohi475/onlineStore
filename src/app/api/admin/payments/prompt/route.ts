import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { sameOrigin } from "@/lib/auth/rate-limit";
import { MPESA_ON } from "@/lib/mpesa";
import { sendPrompt } from "@/lib/mpesa-orders";
import { getOrders } from "@/lib/store/store";

export const runtime = "nodejs";

/** POST { orderId, phone } — admin sends the customer an M-Pesa payment prompt. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return unauthorized();
  if (!MPESA_ON) return NextResponse.json({ error: "M-Pesa prompts aren't set up yet." }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { orderId?: string; phone?: string } | null;
  const order = (await getOrders()).find((o) => o.id === body?.orderId);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (["cancelled", "refunded"].includes(order.status)) return NextResponse.json({ error: `This order is ${order.status}.` }, { status: 400 });
  const r = await sendPrompt(order, body?.phone || order.customer.phone, req);
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: 400 });
  return NextResponse.json(r.order);
}

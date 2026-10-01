import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { sameOrigin } from "@/lib/auth/rate-limit";
import { amountDue, applyPayment, normalizeMpesaCode, usedCodes } from "@/lib/payments";
import { getOrders, updateOrder } from "@/lib/store/store";

export const runtime = "nodejs";

/**
 * POST /api/admin/payments — resolve a payment.
 *  { orderId, method: "M-Pesa" | "Cash", code?, amount, markDelivered? }
 * M-Pesa needs a valid, never-used transaction code. Cash can also close the
 * order as delivered ("delivered & paid in cash").
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const method = body.method === "Cash" ? "Cash" : body.method === "M-Pesa" ? "M-Pesa" : null;
  if (!method) return NextResponse.json({ error: "Choose M-Pesa or Cash." }, { status: 400 });

  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    return NextResponse.json({ error: "Enter the amount received (in Ksh)." }, { status: 400 });
  }

  const orders = await getOrders();
  const orderId = String(body.orderId ?? "");
  const target = orders.find((o) => o.id === orderId);
  if (!target) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (["cancelled", "refunded"].includes(target.status)) {
    return NextResponse.json({ error: `This order is ${target.status}.` }, { status: 400 });
  }
  if (target.paymentStatus === "paid" && amountDue(target) === 0 && !body.markDelivered) {
    return NextResponse.json({ error: "This order is already fully paid." }, { status: 400 });
  }

  let code: string | undefined;
  if (method === "M-Pesa") {
    const c = normalizeMpesaCode(body.code);
    if (!c) return NextResponse.json({ error: "Enter a valid M-Pesa code (10 letters and numbers, e.g. QJK3ABC12D)." }, { status: 400 });
    if (usedCodes(orders).has(c)) return NextResponse.json({ error: `M-Pesa code ${c} has already been used for another payment.` }, { status: 409 });
    code = c;
  }
  if (amount > amountDue(target) + 1 && amountDue(target) > 0) {
    return NextResponse.json({ error: `That's more than the balance due (Ksh ${amountDue(target).toLocaleString("en-KE")}).` }, { status: 400 });
  }

  const updated = await updateOrder(orderId, (o) =>
    amountDue(o) === 0 ? (body.markDelivered ? applyPaymentDeliveredOnly(o) : o) : applyPayment(o, { method, code, amount, markDelivered: !!body.markDelivered }),
  );
  if (!updated) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json(updated);
}

function applyPaymentDeliveredOnly<T extends { status: string; timeline: { at: string; label: string; by?: string }[] }>(o: T): T {
  if (o.status !== "delivered") {
    o.status = "delivered";
    o.timeline.push({ at: new Date().toISOString(), label: "Delivered to customer", by: "Admin" });
  }
  return o;
}

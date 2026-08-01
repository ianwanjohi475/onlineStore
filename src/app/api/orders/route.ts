import { NextResponse } from "next/server";
import { addOrder } from "@/lib/store/store";
import type { Order, PaymentStatus } from "@/lib/types";

/** M-Pesa / Card settle instantly in this demo; Cash on Delivery is collected later. */
function derivePaymentStatus(method: string): PaymentStatus {
  return /cash|delivery|cod/i.test(method) ? "pending" : "paid";
}

function makeTxnId(method: string, id: string): string {
  if (/m-?pesa/i.test(method)) return `MPE${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
  if (/card/i.test(method)) return `CARD-${Math.floor(100000 + Math.random() * 900000)}`;
  return `COD-${id.replace(/\D/g, "")}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const num = Math.floor(100000 + Math.random() * 900000);
  const id = `SVE-${num}`;
  const method = body.payment ?? "M-Pesa";
  const paymentStatus = derivePaymentStatus(method);
  const now = new Date().toISOString();

  const order: Order = {
    id,
    number: `#${id}`,
    date: now,
    status: "pending",
    paymentStatus,
    items: body.items ?? [],
    subtotal: Number(body.subtotal) || 0,
    shipping: Number(body.shipping) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    payment: method,
    transactionId: makeTxnId(method, id),
    refunded: 0,
    customer: body.customer ?? { name: "Guest", email: "", phone: "", address: "", city: "" },
    timeline: [
      { at: now, label: "Order placed" },
      ...(paymentStatus === "paid" ? [{ at: now, label: "Payment received" }] : []),
    ],
    notes: [],
  };
  addOrder(order);
  return NextResponse.json({ ok: true, number: order.number });
}

import { NextResponse } from "next/server";
import { addOrder } from "@/lib/store/store";
import type { Order } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const num = Math.floor(100000 + Math.random() * 900000);
  const order: Order = {
    id: `ORA-${num}`,
    number: `#ORA-${num}`,
    date: new Date().toISOString(),
    status: "pending",
    items: body.items ?? [],
    subtotal: Number(body.subtotal) || 0,
    shipping: Number(body.shipping) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    payment: body.payment ?? "M-Pesa",
    customer: body.customer ?? { name: "Guest", email: "", phone: "", address: "", city: "" },
  };
  addOrder(order);
  return NextResponse.json({ ok: true, number: order.number });
}

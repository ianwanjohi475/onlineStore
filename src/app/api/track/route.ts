import { NextResponse } from "next/server";
import { getOrders } from "@/lib/store/store";

/** Public order lookup for the Track Order page. Returns only what a shopper
 *  needs to follow their delivery — no other customer data. */
export async function GET(req: Request) {
  const raw = (new URL(req.url).searchParams.get("number") || "").trim().toUpperCase();
  if (!raw) return NextResponse.json({ error: "Enter your order number." }, { status: 400 });
  const needle = raw.replace(/^#/, "");

  const orders = await getOrders();
  const order = orders.find((o) => {
    const num = o.number.toUpperCase().replace(/^#/, "");
    return num === needle || o.id.toUpperCase() === needle;
  });

  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order with that number. Double-check it and try again." }, { status: 404 });
  }

  return NextResponse.json({
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    date: order.date,
    total: order.total,
    timeline: order.timeline ?? [],
  });
}

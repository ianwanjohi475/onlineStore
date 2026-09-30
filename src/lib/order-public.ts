import type { Order } from "@/lib/types";

/** What a shopper may see about their own order — no phone, email or street address. */
export function publicOrder(order: Order) {
  return {
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    payment: order.payment,
    date: order.date,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    city: order.customer?.city ?? "",
    items: (order.items ?? []).map((i) => ({ slug: i.slug, name: i.name, quantity: i.quantity, price: i.price })),
    timeline: (order.timeline ?? []).map((t) => ({ at: t.at, label: t.label })),
  };
}

export type PublicOrder = ReturnType<typeof publicOrder>;

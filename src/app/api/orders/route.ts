import { NextResponse } from "next/server";
import { addOrder, getProducts } from "@/lib/store/store";
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

export const runtime = "nodejs";

/** Clamp untrusted strings so a hostile payload can't bloat storage. */
const str = (v: unknown, max = 200) => String(v ?? "").slice(0, max).trim();
/** Coerce to a sane, non-negative number. */
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 100_000_000) : 0;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Validate line items against the real catalogue — never trust client prices.
  type Line = { slug: string; name: string; price: number; quantity: number };
  const catalogue = await getProducts();
  const rawItems: unknown[] = Array.isArray(body.items) ? (body.items as unknown[]).slice(0, 50) : [];
  const items: Line[] = [];
  for (const raw of rawItems) {
    const it = (raw ?? {}) as { slug?: unknown; quantity?: unknown };
    const product = catalogue.find((p) => p.slug === str(it.slug, 120));
    if (!product) continue;
    const quantity = Math.max(1, Math.min(99, Math.floor(num(it.quantity)) || 1));
    items.push({ slug: product.slug, name: product.name, price: product.price, quantity });
  }

  if (items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  const num6 = Math.floor(100000 + Math.random() * 900000);
  const id = `SVE-${num6}`;
  const method = str(body.payment, 40) || "M-Pesa";
  const paymentStatus = derivePaymentStatus(method);
  const now = new Date().toISOString();

  // Recompute money server-side from catalogue prices.
  const subtotal = items.reduce((sum: number, i: Line) => sum + i.price * i.quantity, 0);
  const shipping = num(body.shipping);
  const discount = Math.min(num(body.discount), subtotal);
  const total = Math.max(0, subtotal + shipping - discount);

  const c = (body.customer ?? {}) as Record<string, unknown>;
  const order: Order = {
    id,
    number: `#${id}`,
    date: now,
    status: "pending",
    paymentStatus,
    items,
    subtotal,
    shipping,
    discount,
    total,
    payment: method,
    transactionId: makeTxnId(method, id),
    refunded: 0,
    customer: {
      name: str(c.name, 120) || "Guest",
      email: str(c.email, 160),
      phone: str(c.phone, 40),
      address: str(c.address, 300),
      city: str(c.city, 80),
    },
    timeline: [
      { at: now, label: "Order placed" },
      ...(paymentStatus === "paid" ? [{ at: now, label: "Payment received" }] : []),
    ],
    notes: [],
  };
  try {
    await addOrder(order);
  } catch (e) {
    console.error("Failed to save order:", e);
    return NextResponse.json({ error: "Could not save your order. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, number: order.number });
}

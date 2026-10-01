import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { addOrder, findOrderByNumber, getProducts, getSettings } from "@/lib/store/store";
import { currentUser } from "@/lib/store/users";
import { normalizeMpesaCode } from "@/lib/payments";
import { MPESA_ON, normalizePhone, payToken } from "@/lib/mpesa";
import { promptStatus, sendPrompt } from "@/lib/mpesa-orders";
import type { Order } from "@/lib/types";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

/** Clamp untrusted strings so a hostile payload can't bloat storage. */
const str = (v: unknown, max = 200) => String(v ?? "").slice(0, max).trim();
/** Coerce to a sane, non-negative number. */
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 100_000_000) : 0;
};

/** Order numbers are random and long enough that they can't be guessed or enumerated. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newOrderId() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `SVE-${s}`;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`order:${clientIp(req)}`, 30, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many orders from this connection. Please wait a few minutes." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const c = (body.customer ?? {}) as Record<string, unknown>;
  const customer = {
    name: str(c.name, 120),
    email: str(c.email, 160),
    phone: str(c.phone, 40),
    address: str(c.address, 300),
    city: str(c.city, 80),
  };
  if (!customer.name || !customer.phone || !customer.address || !customer.city) {
    return NextResponse.json({ error: "Please fill in your name, phone and delivery address." }, { status: 400 });
  }
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Only M-Pesa (pay to our Till) and Cash on Delivery. Nothing is marked paid
  // here — an admin verifies the M-Pesa code / cash and resolves the payment.
  const method = /cash|delivery|cod/i.test(str(body.payment, 40)) ? "Cash on Delivery" : /m-?pesa/i.test(str(body.payment, 40)) ? "M-Pesa" : null;
  if (!method) return NextResponse.json({ error: "Please choose M-Pesa or Cash on delivery." }, { status: 400 });
  const paymentStatus = "pending" as const;
  const customerRef = method === "M-Pesa" && body.mpesaCode ? normalizeMpesaCode(body.mpesaCode) : null;
  if (method === "M-Pesa" && body.mpesaCode && !customerRef) {
    return NextResponse.json({ error: "That M-Pesa code doesn't look right — it has 10 letters and numbers, e.g. QJK3ABC12D." }, { status: 400 });
  }

  // "Pay now" with an M-Pesa prompt to the customer's phone (when set up).
  const wantsPrompt = method === "M-Pesa" && !customerRef && body.stk === true && MPESA_ON;
  const promptPhone = wantsPrompt ? normalizePhone(body.mpesaPhone || customer.phone) : null;
  if (wantsPrompt && !promptPhone) {
    return NextResponse.json({ error: "Enter the Safaricom number to pay with, e.g. 0712 345 678." }, { status: 400 });
  }

  // Validate line items against the real catalogue — never trust client prices.
  type Line = { slug: string; name: string; price: number; quantity: number };
  const catalogue = await getProducts();
  const rawItems: unknown[] = Array.isArray(body.items) ? (body.items as unknown[]).slice(0, 50) : [];
  const items: Line[] = [];
  for (const raw of rawItems) {
    const it = (raw ?? {}) as { slug?: unknown; quantity?: unknown };
    const product = catalogue.find((p) => p.slug === str(it.slug, 120));
    if (!product) continue;
    if (!product.inStock) return NextResponse.json({ error: `${product.name} is sold out. Please remove it from your cart.` }, { status: 409 });
    const quantity = Math.max(1, Math.min(99, Math.floor(num(it.quantity)) || 1));
    items.push({ slug: product.slug, name: product.name, price: product.price, quantity });
  }

  if (items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  let id = newOrderId();
  while (await findOrderByNumber(id)) id = newOrderId();
  const now = new Date().toISOString();

  // Recompute ALL money server-side — catalogue prices, the store's delivery
  // fee and a validated promo code. Nothing price-related is taken from the browser.
  const settings = await getSettings();
  const subtotal = items.reduce((sum: number, i: Line) => sum + i.price * i.quantity, 0);
  const code = str(body.promoCode, 40).toUpperCase();
  const promo = code ? settings.promos.find((p) => p.code.toUpperCase() === code) : undefined;
  const discount = promo?.kind === "percent" ? Math.min(subtotal, Math.round((subtotal * Math.min(100, promo.value ?? 0)) / 100)) : 0;
  const shipping = subtotal >= settings.freeShipThreshold || promo?.kind === "ship" ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount) + shipping;
  const user = await currentUser();
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
    refunded: 0,
    amountPaid: 0,
    payments: [],
    ...(customerRef ? { customerRef } : {}),
    customer,
    ...(user ? { userId: user.id } : {}),
    timeline: [
      { at: now, label: "Order placed" },
      ...(customerRef ? [{ at: now, label: `Customer paid by M-Pesa (${customerRef}) — awaiting confirmation` }] : []),
    ],
    notes: [],
  };
  try {
    await addOrder(order);
  } catch (e) {
    console.error("Failed to save order:", e);
    return NextResponse.json({ error: "Could not save your order. Please try again." }, { status: 500 });
  }
  await logActivity(
    "order",
    "success",
    `New order ${order.number} from ${customer.name} — Ksh ${total.toLocaleString("en-KE")} · ${method === "M-Pesa" ? "M-Pesa" : "Cash on delivery"} · ${items.reduce((n, i) => n + i.quantity, 0)} item(s)`,
    { ref: order.number, req },
  );
  if (customerRef) await logActivity("payment", "info", `Customer entered M-Pesa code ${customerRef} for ${order.number} — waiting for you to verify`, { ref: order.number });
  const pay = wantsPrompt ? await sendPrompt(order, promptPhone, req) : null;
  return NextResponse.json({
    ok: true,
    number: order.number,
    total: order.total,
    t: method === "M-Pesa" ? payToken(order.id) : undefined,
    prompt: pay ? { ...promptStatus(pay.order), sent: pay.ok, message: pay.message } : null,
  });
}

import type { Order, PaymentRecord } from "@/lib/types";

/** M-Pesa transaction codes are 10 letters/digits, e.g. "QJK3ABC12D". */
export function normalizeMpesaCode(v: unknown): string | null {
  const code = String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-Z0-9]{8,12}$/.test(code) && /[A-Z]/.test(code) && /\d/.test(code) ? code : null;
}

export const amountDue = (o: Order) => Math.max(0, o.total - (o.amountPaid ?? 0));

/** Every M-Pesa code already used on any order (to stop a code being reused). */
export function usedCodes(orders: Order[], exceptOrderId?: string): Set<string> {
  const set = new Set<string>();
  for (const o of orders) {
    if (o.id === exceptOrderId) continue;
    for (const p of o.payments ?? []) if (p.code) set.add(p.code);
  }
  return set;
}

/**
 * Record a verified payment on an order. Full amount → "paid" (and optionally
 * "delivered" for cash on delivery); less → stays pending with a partial-payment
 * entry so the balance is visible.
 */
export function applyPayment(
  o: Order,
  p: { method: PaymentRecord["method"]; code?: string; amount: number; markDelivered?: boolean },
  now = new Date().toISOString(),
): Order {
  const record: PaymentRecord = { at: now, method: p.method, amount: p.amount, by: "Admin", ...(p.code ? { code: p.code } : {}) };
  o.payments = [...(o.payments ?? []), record];
  o.amountPaid = (o.amountPaid ?? 0) + p.amount;
  o.timeline = o.timeline ?? [];
  const money = `Ksh ${p.amount.toLocaleString("en-KE")}`;
  o.timeline.push({
    at: now,
    label: p.method === "Cash" ? `Cash received · ${money}` : `M-Pesa payment ${p.code} verified · ${money}`,
    by: "Admin",
  });
  if (o.amountPaid >= o.total) {
    if (o.paymentStatus !== "paid") o.timeline.push({ at: now, label: "Payment complete", by: "Admin" });
    o.paymentStatus = "paid";
    o.transactionId = p.code ?? o.transactionId ?? `CASH-${o.id.replace(/^SVE-/, "")}`;
    if (o.status === "pending") o.status = "confirmed";
  } else {
    o.timeline.push({ at: now, label: `Balance due · Ksh ${(o.total - o.amountPaid).toLocaleString("en-KE")}`, by: "Admin" });
  }
  if (p.markDelivered && o.status !== "delivered") {
    o.status = "delivered";
    o.timeline.push({ at: now, label: "Delivered to customer", by: "Admin" });
  }
  return o;
}

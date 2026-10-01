import "server-only";
import { amountDue, applyPayment, usedCodes } from "@/lib/payments";
import { callbackUrl, normalizePhone, stkMessage, stkPush, stkQuery } from "@/lib/mpesa";
import { logActivity } from "@/lib/store/activity";
import { getOrders, updateOrder } from "@/lib/store/store";
import type { Order } from "@/lib/types";

const ksh = (n: number) => `Ksh ${n.toLocaleString("en-KE")}`;

/** Send (or re-send) the M-Pesa payment prompt for an order's balance. */
export async function sendPrompt(order: Order, rawPhone: unknown, req: Request): Promise<{ ok: boolean; message: string; order: Order }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, message: "Enter a valid Safaricom number, e.g. 0712 345 678.", order };
  const amount = amountDue(order);
  if (amount <= 0) return { ok: false, message: "This order is already paid.", order };

  const r = await stkPush({ amount, phone, reference: order.id, callback: callbackUrl(req) });
  if (!r.ok) {
    await logActivity("mpesa", "error", `M-Pesa prompt for ${order.number} could not be sent: ${r.error}`, { ref: order.number, req });
    return { ok: false, message: "We couldn't reach M-Pesa right now. Please try again, or pay to our Till number.", order };
  }
  const now = new Date().toISOString();
  const updated =
    (await updateOrder(order.id, (o) => {
      o.stk = { checkoutRequestId: r.checkoutRequestId, merchantRequestId: r.merchantRequestId, phone, amount, at: now, status: "pending", attempts: (o.stk?.attempts ?? 0) + 1 };
      o.timeline = [...(o.timeline ?? []), { at: now, label: `M-Pesa payment prompt sent to ${phone.replace(/^254(\d{3})\d{3}(\d{3})$/, "0$1***$2")}` }];
      return o;
    })) ?? order;
  await logActivity("mpesa", "info", `M-Pesa prompt sent to ${phone} for ${order.number} — ${ksh(amount)}`, { ref: order.number, req });
  return { ok: true, message: "Check your phone and enter your M-Pesa PIN.", order: updated };
}

/**
 * Record how an M-Pesa prompt ended (from Safaricom's callback or a status
 * query). Idempotent: the same result arriving twice changes nothing.
 */
export async function settlePrompt(
  checkoutRequestId: string,
  result: { code: number; desc: string; receipt?: string; amount?: number; phone?: string },
  source: "callback" | "query",
): Promise<Order | null> {
  const orders = await getOrders();
  const target = orders.find((o) => o.stk?.checkoutRequestId === checkoutRequestId);
  if (!target) {
    await logActivity("mpesa", "warning", `M-Pesa result for an unknown payment request (${checkoutRequestId.slice(0, 24)}) was ignored`);
    return null;
  }
  const receipt = result.receipt?.toUpperCase();
  if (receipt && usedCodes(orders, target.id).has(receipt)) {
    await logActivity("security", "error", `M-Pesa receipt ${receipt} was already used on another order — ${target.number} NOT marked paid`, { ref: target.number });
    return target;
  }

  let note: { level: "success" | "warning" | "info"; message: string } | null = null;
  const updated = await updateOrder(target.id, (o) => {
    const stk = o.stk;
    if (!stk || stk.checkoutRequestId !== checkoutRequestId) return o;
    const now = new Date().toISOString();
    if (result.code === 0) {
      if (stk.status === "paid") {
        // paid earlier via a status check — now attach the receipt number
        if (receipt && !stk.receipt) {
          stk.receipt = receipt;
          const p = [...(o.payments ?? [])].reverse().find((x) => x.method === "M-Pesa" && !x.code && x.by.startsWith("M-Pesa"));
          if (p) p.code = receipt;
          o.transactionId = receipt;
          note = { level: "info", message: `M-Pesa receipt ${receipt} recorded for ${o.number}` };
        }
        return o;
      }
      const amount = Math.round(result.amount ?? stk.amount);
      stk.status = "paid";
      stk.receipt = receipt;
      stk.resultDesc = result.desc;
      applyPayment(o, { method: "M-Pesa", code: receipt, amount, by: "M-Pesa (automatic)" }, now);
      note = { level: "success", message: `M-Pesa payment received for ${o.number}: ${ksh(amount)}${receipt ? ` · receipt ${receipt}` : ""}${result.phone ? ` · from ${result.phone}` : ""}${o.paymentStatus === "paid" ? " — order fully paid" : ` — ${ksh(amountDue(o))} still due`}` };
      return o;
    }
    if (stk.status !== "pending") return o;
    stk.status = result.code === 1032 ? "cancelled" : "failed";
    stk.resultDesc = stkMessage(result.code, result.desc);
    o.timeline = [...(o.timeline ?? []), { at: now, label: `M-Pesa payment not completed — ${stk.resultDesc}` }];
    note = { level: "warning", message: `M-Pesa payment for ${o.number} not completed: ${stk.resultDesc}` };
    return o;
  });
  if (note) await logActivity("mpesa", (note as { level: "success" | "warning" | "info" }).level, `${(note as { message: string }).message}${source === "query" ? " (confirmed by status check)" : ""}`, { ref: target.number });
  return updated;
}

/** If a prompt is still "pending" and Safaricom's callback is slow, ask them directly. */
export async function refreshPrompt(order: Order): Promise<Order> {
  const stk = order.stk;
  if (!stk || stk.status !== "pending") return order;
  const age = Date.now() - new Date(stk.at).getTime();
  const sinceCheck = stk.checkedAt ? Date.now() - new Date(stk.checkedAt).getTime() : Infinity;
  if (age < 15_000 || sinceCheck < 8_000) return order;

  await updateOrder(order.id, (o) => {
    if (o.stk) o.stk.checkedAt = new Date().toISOString();
    return o;
  });
  const q = await stkQuery(stk.checkoutRequestId);
  if (q.resultCode !== null) return (await settlePrompt(stk.checkoutRequestId, { code: q.resultCode, desc: q.resultDesc }, "query")) ?? order;
  // no answer after 3 minutes → treat as timed out so the customer can retry
  if (age > 180_000) return (await settlePrompt(stk.checkoutRequestId, { code: 1037, desc: "" }, "query")) ?? order;
  return order;
}

export function promptStatus(order: Order) {
  const stk = order.stk;
  const paid = order.paymentStatus === "paid";
  return {
    status: paid ? "paid" : stk?.status ?? "none",
    message: paid ? "Payment received — thank you!" : stk?.status === "pending" ? "Waiting for you to enter your M-Pesa PIN…" : stk?.resultDesc ?? "",
    receipt: stk?.receipt ?? null,
    amountDue: amountDue(order),
    phone: stk?.phone ? `0${stk.phone.slice(3)}` : null,
  };
}

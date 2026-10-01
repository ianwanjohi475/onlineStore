"use client";

import { Banknote, CheckCircle2, Search, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Btn, Drawer, api } from "@/components/admin/kit";
import { amountDue, normalizeMpesaCode } from "@/lib/payments";
import type { Order } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

/**
 * "Resolve payment": confirm an M-Pesa Till payment (transaction code + amount)
 * or cash received (optionally closing the order as delivered).
 */
export function ResolvePayment({
  open,
  orders,
  initialOrderId,
  initialMethod = "M-Pesa",
  onClose,
  onDone,
}: {
  open: boolean;
  orders: Order[];
  initialOrderId?: string;
  initialMethod?: "M-Pesa" | "Cash";
  onClose: () => void;
  onDone: (o: Order) => void;
}) {
  const open_ = orders.filter((o) => !["cancelled", "refunded"].includes(o.status) && (amountDue(o) > 0 || o.status !== "delivered"));
  const [orderId, setOrderId] = useState(initialOrderId ?? "");
  const [method, setMethod] = useState<"M-Pesa" | "Cash">(initialMethod);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [delivered, setDelivered] = useState(initialMethod === "Cash");
  const [find, setFind] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const order = orders.find((o) => o.id === orderId);
  const due = order ? amountDue(order) : 0;

  // reset each time it opens
  useEffect(() => {
    if (!open) return;
    const o = orders.find((x) => x.id === initialOrderId);
    setOrderId(initialOrderId ?? "");
    setMethod(initialMethod);
    setDelivered(initialMethod === "Cash");
    setCode(o?.customerRef ?? "");
    setAmount(o ? String(amountDue(o)) : "");
    setFind("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialOrderId, initialMethod]);

  const matches = useMemo(() => {
    const q = find.trim().toLowerCase().replace(/^#/, "");
    const list = open_.filter((o) => amountDue(o) > 0 || method === "Cash");
    if (!q) return list.slice(0, 8);
    return list
      .filter((o) =>
        o.number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        (o.customer.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~") ||
        (o.customerRef ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [find, open_, method]);

  const codeOk = method === "Cash" || !!normalizeMpesaCode(code);
  const amt = Number(amount);
  const amountOk = Number.isFinite(amt) && amt > 0 && (due === 0 || amt <= due);

  const submit = async () => {
    if (!order) return setError("Choose the order this payment is for.");
    if (!codeOk) return setError("Enter the M-Pesa code from the payment SMS (10 letters and numbers).");
    if (!amountOk) return setError(due ? `Enter an amount up to ${formatPrice(due)}.` : "Enter the amount received.");
    setBusy(true);
    setError("");
    try {
      const updated = await api("/api/admin/payments", "POST", { orderId: order.id, method, code: method === "M-Pesa" ? code : undefined, amount: amt, markDelivered: method === "Cash" && delivered });
      onDone(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record the payment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      title="Resolve payment"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Btn variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn className="flex-1" disabled={busy || !order} onClick={submit}>{busy ? "Saving…" : method === "Cash" && delivered ? "Confirm & close" : "Confirm payment"}</Btn>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* method */}
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "M-Pesa", icon: Smartphone, label: "M-Pesa (Till)", sub: "Enter the code" },
            { id: "Cash", icon: Banknote, label: "Cash", sub: "Paid on delivery" },
          ] as const).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMethod(m.id); setDelivered(m.id === "Cash"); setError(""); }}
              aria-pressed={method === m.id}
              className={cn("flex items-center gap-2 rounded-xl border-2 p-3 text-left", method === m.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-border")}
            >
              <m.icon size={20} className={m.id === "M-Pesa" ? "text-emerald-600" : "text-amber-600"} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted">{m.sub}</span>
              </span>
            </button>
          ))}
        </div>

        {/* order */}
        <div>
          <p className="text-sm font-medium">Order</p>
          {order ? (
            <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="font-semibold">{order.number} <span className="text-xs font-normal text-muted">· {order.payment}</span></p>
                <p className="truncate text-xs text-muted">{order.customer.name} · {order.customer.phone}</p>
                <p className="mt-1 text-sm">Total {formatPrice(order.total)}{(order.amountPaid ?? 0) > 0 && <> · paid {formatPrice(order.amountPaid!)}</>} · <b>due {formatPrice(due)}</b></p>
                {order.customerRef && <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Customer entered code: <b className="font-mono">{order.customerRef}</b></p>}
              </div>
              {!initialOrderId && <button type="button" onClick={() => setOrderId("")} className="shrink-0 text-xs font-semibold text-brand-600 hover:underline">Change</button>}
            </div>
          ) : (
            <div className="mt-1.5">
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:border-brand-500">
                <Search size={15} className="text-muted" />
                <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Order #, customer name, phone or code" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </div>
              <div className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto">
                {matches.length === 0 ? (
                  <p className="p-3 text-center text-sm text-muted">No unpaid orders match.</p>
                ) : (
                  matches.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => { setOrderId(o.id); setAmount(String(amountDue(o) || o.total)); if (o.customerRef) setCode(o.customerRef); setError(""); }}
                      className="flex items-center justify-between gap-3 rounded-lg p-2.5 text-left text-sm hover:bg-surface-2"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold">{o.number}</span>
                        <span className="block truncate text-xs text-muted">{o.customer.name} · {o.payment}{o.customerRef ? ` · code ${o.customerRef}` : ""}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatPrice(amountDue(o) || o.total)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {method === "M-Pesa" && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">M-Pesa transaction code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
              placeholder="e.g. QJK3ABC12D"
              autoComplete="off"
              className={cn("h-11 rounded-lg border bg-background px-3 font-mono text-base uppercase tracking-wider outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:border-brand-500", code && !codeOk ? "border-rose-400" : "border-border")}
            />
            <span className="text-xs text-muted">Copy it from the M-Pesa SMS on your Till / business phone. Each code can only be used once.</span>
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Amount received (Ksh)</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 8))}
            placeholder="0"
            className={cn("h-11 rounded-lg border bg-background px-3 text-base tabular-nums outline-none focus:border-brand-500", amount && !amountOk ? "border-rose-400" : "border-border")}
          />
          {order && amountOk && amt < due && <span className="text-xs text-amber-600">Partial payment — {formatPrice(due - amt)} will remain due.</span>}
        </label>

        {method === "Cash" && (
          <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
            <input type="checkbox" checked={delivered} onChange={(e) => setDelivered(e.target.checked)} className="mt-0.5 size-4 accent-brand-500" />
            <span><b>Order delivered</b><span className="block text-xs text-muted">Also mark the order as delivered (closes it).</span></span>
          </label>
        )}

        {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {order && codeOk && amountOk && !error && (
          <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={14} /> Ready to confirm</p>
        )}
      </div>
    </Drawer>
  );
}

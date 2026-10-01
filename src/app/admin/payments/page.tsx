"use client";

import { Banknote, CheckCircle2, Clock, Download, RotateCcw, Smartphone, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Btn, Card, EmptyState, PageHeader, Pagination, SearchInput, StatCard, StatusPill, api, usePaginated,
} from "@/components/admin/kit";
import { ResolvePayment } from "@/components/admin/resolve-payment";
import { useToast } from "@/context/toast";
import { useLive } from "@/hooks/use-live";
import { PAYMENT_METHODS, PAYMENT_STATUSES, titleCase } from "@/lib/orders";
import { amountDue } from "@/lib/payments";
import type { Order, PaymentRecord } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

type Period = "today" | "week" | "month" | "year";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
};

export default function PaymentsAdmin() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [period, setPeriod] = useState<Period>("month");
  const [resolve, setResolve] = useState<{ orderId?: string; method: "M-Pesa" | "Cash" } | null>(null);

  const load = () => api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);
  useLive(load);

  const list = orders ?? [];
  const active = list.filter((o) => !["cancelled", "refunded"].includes(o.status));

  // money actually received, newest first
  const received = useMemo(
    () =>
      list
        .flatMap((o) => (o.payments ?? []).map((p) => ({ ...p, order: o })))
        .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    [list],
  );
  const pending = useMemo(
    () => active.filter((o) => amountDue(o) > 0).sort((a, b) => Number(!!b.customerRef) - Number(!!a.customerRef) || +new Date(b.date) - +new Date(a.date)),
    [active],
  );

  const periodStart = useMemo(() => {
    const d = new Date();
    if (period === "today") d.setHours(0, 0, 0, 0);
    else if (period === "week") d.setDate(d.getDate() - 7);
    else if (period === "month") d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    return d;
  }, [period]);
  const inPeriod = received.filter((p) => new Date(p.at) >= periodStart);
  const sum = (ps: (PaymentRecord & { order: Order })[]) => ps.reduce((n, p) => n + p.amount, 0);

  const filtered = useMemo(() => {
    let l = [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (status !== "all") l = l.filter((o) => o.paymentStatus === status);
    if (method !== "all") l = l.filter((o) => o.payment === method);
    const q = query.trim().toLowerCase();
    if (q) l = l.filter((o) => o.number.toLowerCase().includes(q) || (o.transactionId ?? "").toLowerCase().includes(q) || (o.customerRef ?? "").toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
    return l;
  }, [list, status, method, query]);
  const { slice, page, pages, setPage } = usePaginated(filtered, 12);

  const refund = async (o: Order) => {
    await api("/api/admin/orders", "PUT", { id: o.id, paymentStatus: "refunded", status: "refunded" }).catch(() => {});
    toast(`Refunded ${o.number}`);
    load();
  };

  const exportCsv = () => {
    const header = ["Date", "Order", "Customer", "Method", "M-Pesa code", "Amount"];
    const lines = received.map((p) => [new Date(p.at).toISOString(), p.order.number, p.order.customer.name, p.method, p.code ?? "", p.amount]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = "h-10 rounded-lg border border-border bg-surface px-3 text-sm capitalize outline-none focus:border-brand-500 min-w-0 flex-1 sm:flex-none";

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Confirm M-Pesa Till and cash payments"
        actions={
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => setResolve({ method: "M-Pesa" })}><CheckCircle2 size={16} /> Resolve payment</Btn>
            <Btn variant="outline" onClick={exportCsv}><Download size={15} /> <span className="hidden sm:inline">Export</span></Btn>
          </div>
        }
      />

      {/* period */}
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="text-sm capitalize text-muted">Received · {period}</p>
          <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{orders ? formatPrice(sum(inPeriod)) : "—"}</p>
        </div>
        <div className="flex w-full gap-1 rounded-xl bg-surface-2 p-1 sm:w-auto">
          {(["today", "week", "month", "year"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={cn("flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors sm:flex-none", period === p ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground")}>{p}</button>
          ))}
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="M-Pesa (Till)" value={orders ? formatPrice(sum(inPeriod.filter((p) => p.method === "M-Pesa"))) : "—"} icon={Smartphone} />
        <StatCard label="Cash" value={orders ? formatPrice(sum(inPeriod.filter((p) => p.method === "Cash"))) : "—"} icon={Banknote} />
        <StatCard label="Awaiting payment" value={orders ? String(pending.length) : "—"} icon={Clock} />
        <StatCard label="Amount due" value={orders ? formatPrice(pending.reduce((n, o) => n + amountDue(o), 0)) : "—"} icon={Wallet} />
      </div>

      {/* pending | completed */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 font-display font-bold"><Clock size={16} className="text-amber-500" /> Pending payments</h2>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">{pending.length}</span>
          </div>
          {orders === null ? (
            <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-2" />)}</div>
          ) : pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up" desc="No orders waiting for payment." />
          ) : (
            <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto">
              {pending.slice(0, 30).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", o.payment === "M-Pesa" ? "bg-emerald-500/12 text-emerald-600" : "bg-amber-500/12 text-amber-600")}>
                    {o.payment === "M-Pesa" ? <Smartphone size={17} /> : <Banknote size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold"><Link href={`/admin/orders/${o.id}`} className="hover:text-brand-600">{o.number}</Link> <span className="font-normal text-muted">· {o.customer.name}</span></p>
                    <p className="text-xs text-muted">
                      {o.payment === "M-Pesa" ? "M-Pesa Till" : "Cash on delivery"} · {ago(o.date)}
                      {o.customerRef && <> · code <b className="font-mono text-emerald-700 dark:text-emerald-300">{o.customerRef}</b></>}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrice(amountDue(o))}</span>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Btn size="sm" className="flex-1 sm:flex-none" onClick={() => setResolve({ orderId: o.id, method: "M-Pesa" })}>Resolve</Btn>
                    {o.payment === "Cash on Delivery" && (
                      <Btn size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => setResolve({ orderId: o.id, method: "Cash" })}>Cash received</Btn>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 font-display font-bold"><CheckCircle2 size={16} className="text-emerald-500" /> Completed payments</h2>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">{received.length}</span>
          </div>
          {orders === null ? (
            <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-2" />)}</div>
          ) : received.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments yet" desc="Payments you confirm appear here." />
          ) : (
            <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto">
              {received.slice(0, 30).map((p, i) => (
                <li key={`${p.order.id}-${i}`} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", p.method === "M-Pesa" ? "bg-emerald-500/12 text-emerald-600" : "bg-amber-500/12 text-amber-600")}>
                    {p.method === "M-Pesa" ? <Smartphone size={17} /> : <Banknote size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.method === "M-Pesa" ? <span className="font-mono">{p.code}</span> : "Cash"} <span className="font-normal text-muted">· {p.order.customer.name}</span></p>
                    <p className="text-xs text-muted"><Link href={`/admin/orders/${p.order.id}`} className="hover:text-brand-600">{p.order.number}</Link> · {ago(p.at)}</p>
                  </div>
                  <span className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">+{formatPrice(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* all transactions */}
      <h2 className="mb-3 font-display text-lg font-bold">All orders</h2>
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Order #, M-Pesa code or customer" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Payment status">
          <option value="all">All statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectCls} aria-label="Payment method">
          <option value="all">All methods</option>
          {PAYMENT_METHODS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Card>

      <Card>
        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Wallet} title="No orders" desc="Orders and their payments will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm [&_td]:px-3 [&_th]:px-3 sm:[&_td]:px-5 sm:[&_th]:px-5">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="py-3 font-semibold">Order</th>
                  <th className="hidden py-3 font-semibold md:table-cell">Customer</th>
                  <th className="hidden py-3 font-semibold sm:table-cell">Method</th>
                  <th className="hidden py-3 font-semibold min-[400px]:table-cell">Status</th>
                  <th className="py-3 text-right font-semibold">Amount</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {slice.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="py-3">
                      <Link href={`/admin/orders/${o.id}`} className="whitespace-nowrap font-medium hover:text-brand-600">{o.number}</Link>
                      {o.transactionId && <p className="font-mono text-[11px] text-muted">{o.transactionId}</p>}
                    </td>
                    <td className="hidden py-3 text-muted md:table-cell">{o.customer.name}</td>
                    <td className="hidden py-3 sm:table-cell">{o.payment}</td>
                    <td className="hidden py-3 min-[400px]:table-cell"><StatusPill status={o.paymentStatus} /></td>
                    <td className="py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="py-3 text-right">
                      {amountDue(o) > 0 && !["cancelled", "refunded"].includes(o.status) ? (
                        <Btn size="sm" variant="ghost" aria-label={`Resolve ${o.number}`} onClick={() => setResolve({ orderId: o.id, method: o.payment === "Cash on Delivery" ? "Cash" : "M-Pesa" })}><CheckCircle2 size={15} /> <span className="hidden sm:inline">Resolve</span></Btn>
                      ) : o.paymentStatus === "paid" ? (
                        <Btn size="sm" variant="ghost" onClick={() => refund(o)}><RotateCcw size={14} /> <span className="hidden sm:inline">Refund</span></Btn>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-border p-4"><Pagination page={page} pages={pages} setPage={setPage} total={filtered.length} /></div>
          </div>
        )}
      </Card>

      <ResolvePayment
        open={!!resolve}
        orders={list}
        initialOrderId={resolve?.orderId}
        initialMethod={resolve?.method}
        onClose={() => setResolve(null)}
        onDone={(o) => { toast(o.paymentStatus === "paid" ? `${o.number} is fully paid` : `Payment recorded — ${formatPrice(amountDue(o))} still due`); load(); }}
      />
    </div>
  );
}

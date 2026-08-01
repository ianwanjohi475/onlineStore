"use client";

import { CreditCard, Download, DollarSign, RotateCcw, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Btn, Card, EmptyState, PageHeader, Pagination, SearchInput, StatCard, StatusPill, api, usePaginated,
} from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import { PAYMENT_METHODS, PAYMENT_STATUSES, titleCase } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type Period = "today" | "week" | "month" | "year";

export default function PaymentsAdmin() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [period, setPeriod] = useState<Period>("month");

  const load = () => api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const list = orders ?? [];

  const revenue = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "week") start.setDate(now.getDate() - 7);
    else if (period === "month") start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);
    return list
      .filter((o) => (o.paymentStatus === "paid" || o.paymentStatus === "partially-refunded") && new Date(o.date) >= start)
      .reduce((n, o) => n + (o.total - (o.refunded ?? 0)), 0);
  }, [list, period]);

  const totals = useMemo(() => {
    const paid = list.filter((o) => o.paymentStatus === "paid");
    const pending = list.filter((o) => o.paymentStatus === "pending");
    const refunded = list.filter((o) => o.paymentStatus === "refunded" || o.paymentStatus === "partially-refunded");
    return {
      collected: paid.reduce((n, o) => n + o.total, 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((n, o) => n + o.total, 0),
      refundedAmount: refunded.reduce((n, o) => n + (o.refunded ?? o.total), 0),
    };
  }, [list]);

  const filtered = useMemo(() => {
    let l = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (status !== "all") l = l.filter((o) => o.paymentStatus === status);
    if (method !== "all") l = l.filter((o) => o.payment === method);
    const q = query.trim().toLowerCase();
    if (q) l = l.filter((o) => o.number.toLowerCase().includes(q) || (o.transactionId ?? "").toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
    return l;
  }, [list, status, method, query]);

  const { slice, page, pages, setPage } = usePaginated(filtered, 12);

  const refund = async (o: Order) => {
    await api("/api/admin/orders", "PUT", { id: o.id, paymentStatus: "refunded", status: "refunded" }).catch(() => {});
    toast(`Refunded ${o.number}`);
    load();
  };

  const exportCsv = () => {
    const header = ["Order", "Date", "Customer", "Method", "Reference", "Status", "Total", "Refunded"];
    const lines = filtered.map((o) => [o.number, new Date(o.date).toISOString(), o.customer.name, o.payment, o.transactionId ?? "", o.paymentStatus, o.total, o.refunded ?? 0]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = "h-10 rounded-lg border border-border bg-surface px-3 text-sm capitalize outline-none focus:border-brand-500";

  return (
    <div>
      <PageHeader title="Payments" subtitle={orders ? `${list.length} transactions` : "Loading…"}
        actions={<Btn variant="outline" size="sm" onClick={exportCsv}><Download size={15} /> Export CSV</Btn>} />

      {/* revenue period card */}
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted">Revenue · {period}</p>
          <p className="font-display text-3xl font-bold tabular-nums">{orders ? formatPrice(revenue) : "—"}</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {(["today", "week", "month", "year"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${period === p ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>{p}</button>
          ))}
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total collected" value={orders ? formatPrice(totals.collected) : "—"} icon={DollarSign} />
        <StatCard label="Pending payments" value={orders ? String(totals.pendingCount) : "—"} icon={Wallet} />
        <StatCard label="Pending amount" value={orders ? formatPrice(totals.pendingAmount) : "—"} icon={CreditCard} />
        <StatCard label="Refunded" value={orders ? formatPrice(totals.refundedAmount) : "—"} icon={RotateCcw} />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Order #, reference or customer" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="all">All statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectCls}>
          <option value="all">All methods</option>
          {PAYMENT_METHODS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Card>

      <Card>
        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title="No transactions" desc="Payments from orders will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Customer</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {slice.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-5 py-3 font-mono text-xs">{o.transactionId ?? "—"}</td>
                    <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">{o.number}</Link></td>
                    <td className="hidden px-5 py-3 text-muted md:table-cell">{o.customer.name}</td>
                    <td className="px-5 py-3">{o.payment}</td>
                    <td className="px-5 py-3"><StatusPill status={o.paymentStatus} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3 text-right">
                      {o.paymentStatus === "paid" && <Btn size="sm" variant="ghost" onClick={() => refund(o)}>Refund</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-border p-4"><Pagination page={page} pages={pages} setPage={setPage} total={filtered.length} /></div>
          </div>
        )}
      </Card>
    </div>
  );
}

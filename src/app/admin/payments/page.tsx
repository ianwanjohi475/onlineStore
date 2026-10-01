"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Banknote, CheckCircle2, Clock, Download, RotateCcw, Smartphone, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Btn, Card, EmptyState, PageHeader, Pagination, SearchInput, StatCard, api, usePaginated,
} from "@/components/admin/kit";
import { ResolvePayment } from "@/components/admin/resolve-payment";
import { useToast } from "@/context/toast";
import { useLive } from "@/hooks/use-live";
import { amountDue } from "@/lib/payments";
import type { Order, SiteSettings } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

type Tab = "completed" | "pending";
type Range = "all" | "today" | "7d" | "30d" | "custom";
type SortKey = "date" | "amount" | "customer";

/** One line in the payments table — a confirmed payment, or an order still owing money. */
interface Row {
  key: string;
  at: string;
  order: Order;
  method: "M-Pesa" | "Cash";
  /** M-Pesa code (confirmed for completed rows; customer-submitted for pending) */
  code: string | null;
  amount: number;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

const dayStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

export default function PaymentsAdmin() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [till, setTill] = useState("");
  const [tab, setTab] = useState<Tab>("completed");
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<"all" | "M-Pesa" | "Cash">("all");
  const [range, setRange] = useState<Range>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [resolve, setResolve] = useState<{ orderId?: string; method: "M-Pesa" | "Cash" } | null>(null);

  const load = () => api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
  useEffect(() => {
    load();
    api("/api/admin/settings", "GET").then((s: SiteSettings) => setTill(s.mpesaTill ?? "")).catch(() => {});
  }, []);
  useLive(load);

  const list = useMemo(() => orders ?? [], [orders]);

  const completed = useMemo<Row[]>(
    () =>
      list.flatMap((o) => {
        if (o.payments?.length) {
          return o.payments.map((p, i) => ({ key: `${o.id}-${i}`, at: p.at, order: o, method: p.method, code: p.code ?? null, amount: p.amount }));
        }
        // older orders marked paid before payment records existed
        return o.paymentStatus === "paid"
          ? [{ key: `${o.id}-legacy`, at: o.date, order: o, method: o.payment === "Cash on Delivery" ? "Cash" as const : "M-Pesa" as const, code: o.transactionId ?? o.customerRef ?? null, amount: o.total }]
          : [];
      }),
    [list],
  );
  const pending = useMemo<Row[]>(
    () =>
      list
        .filter((o) => !["cancelled", "refunded"].includes(o.status) && amountDue(o) > 0)
        .map((o) => ({ key: o.id, at: o.date, order: o, method: o.payment === "Cash on Delivery" ? "Cash" as const : "M-Pesa" as const, code: o.customerRef ?? null, amount: amountDue(o) })),
    [list],
  );

  const rows = useMemo(() => {
    let l = tab === "completed" ? completed : pending;
    if (method !== "all") l = l.filter((r) => r.method === method);

    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    if (range === "today") start = dayStart(now);
    else if (range === "7d") start = new Date(dayStart(now).getTime() - 6 * 864e5);
    else if (range === "30d") start = new Date(dayStart(now).getTime() - 29 * 864e5);
    else if (range === "custom") {
      if (from) start = new Date(`${from}T00:00:00`);
      if (to) end = new Date(`${to}T23:59:59.999`);
    }
    if (start) l = l.filter((r) => new Date(r.at) >= start);
    if (end) l = l.filter((r) => new Date(r.at) <= end);

    const q = query.trim().toLowerCase();
    if (q) {
      l = l.filter((r) =>
        [r.order.number, r.order.customer.name, r.order.customer.phone, r.order.customer.email ?? "", r.code ?? "", String(r.amount)]
          .some((v) => v.toLowerCase().includes(q)),
      );
    }

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...l].sort((a, b) => {
      if (sort.key === "amount") return (a.amount - b.amount) * dir;
      if (sort.key === "customer") return a.order.customer.name.localeCompare(b.order.customer.name) * dir;
      return (+new Date(a.at) - +new Date(b.at)) * dir;
    });
  }, [tab, completed, pending, method, range, from, to, query, sort]);

  const { slice, page, pages, setPage } = usePaginated(rows, 15);
  const total = rows.reduce((n, r) => n + r.amount, 0);
  const mpesaTotal = rows.filter((r) => r.method === "M-Pesa").reduce((n, r) => n + r.amount, 0);
  const cashTotal = total - mpesaTotal;

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: key === "customer" ? "asc" : "desc" }));

  const refund = async (o: Order) => {
    await api("/api/admin/orders", "PUT", { id: o.id, paymentStatus: "refunded", status: "refunded" }).catch(() => {});
    toast(`Refunded ${o.number}`);
    load();
  };

  const exportCsv = () => {
    const header = ["Date", "Order", "Customer", "Phone", "Transaction ID", "Method", "Till", "Amount", "Status"];
    const lines = rows.map((r) =>
      [fmtDate(r.at), r.order.number, r.order.customer.name, r.order.customer.phone, r.code ?? "", r.method, r.method === "M-Pesa" ? till : "", r.amount, tab]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${tab}-payments-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = "h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500 sm:flex-none";
  const sortIcon = (k: SortKey) =>
    sort.key !== k ? <ArrowUpDown size={12} className="opacity-40" /> : sort.dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />;
  const th = (k: SortKey, children: string, className?: string) => (
    <th className={cn("py-3 font-semibold", className)} aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button onClick={() => toggleSort(k)} className={cn("inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground", sort.key === k && "text-foreground")}>
        {children} {sortIcon(k)}
      </button>
    </th>
  );

  const actionCell = (r: Row) =>
    tab === "pending" ? (
      <div className="flex justify-end gap-1.5">
        <Btn size="sm" onClick={() => setResolve({ orderId: r.order.id, method: "M-Pesa" })}>Resolve</Btn>
        {r.method === "Cash" && <Btn size="sm" variant="outline" onClick={() => setResolve({ orderId: r.order.id, method: "Cash" })}>Cash received</Btn>}
      </div>
    ) : r.order.paymentStatus === "paid" && r.order.status !== "refunded" ? (
      <Btn size="sm" variant="ghost" aria-label={`Refund ${r.order.number}`} onClick={() => refund(r.order)}><RotateCcw size={14} /> <span className="md:hidden xl:inline">Refund</span></Btn>
    ) : null;

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`Payments made to the store through M-Pesa${till ? ` (Till ${till})` : ""} and cash on delivery`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => setResolve({ method: "M-Pesa" })}><CheckCircle2 size={16} /> Resolve payment</Btn>
            <Btn variant="outline" onClick={exportCsv} disabled={!rows.length}><Download size={15} /> <span className="hidden sm:inline">Export</span></Btn>
          </div>
        }
      />

      {/* Completed | Pending */}
      <div role="tablist" className="mb-4 flex gap-2">
        {([["completed", "Completed", completed.length], ["pending", "Pending", pending.length]] as const).map(([k, label, n]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => { setTab(k); setPage(1); }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
              tab === k ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {k === "completed" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
            {label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab === k ? "bg-white/20" : "bg-surface-2")}>{orders ? n : "…"}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={tab === "completed" ? "Received" : "Amount due"} value={orders ? formatPrice(total) : "—"} icon={Wallet} />
        <StatCard label={tab === "completed" ? "Payments" : "Orders waiting"} value={orders ? String(rows.length) : "—"} icon={tab === "completed" ? CheckCircle2 : Clock} />
        <StatCard label="M-Pesa (Till)" value={orders ? formatPrice(mpesaTotal) : "—"} icon={Smartphone} />
        <StatCard label="Cash" value={orders ? formatPrice(cashTotal) : "—"} icon={Banknote} />
      </div>

      <Card className="overflow-hidden">
        {/* filters */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search name, phone, code, order #" />
            <select value={method} onChange={(e) => { setMethod(e.target.value as typeof method); setPage(1); }} className={selectCls} aria-label="Payment method">
              <option value="all">All methods</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Cash">Cash</option>
            </select>
            <select
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => { const [key, dir] = e.target.value.split(":") as [SortKey, "asc" | "desc"]; setSort({ key, dir }); }}
              className={selectCls}
              aria-label="Sort payments"
            >
              <option value="date:desc">Most recent first</option>
              <option value="date:asc">Oldest first</option>
              <option value="amount:desc">Amount: high to low</option>
              <option value="amount:asc">Amount: low to high</option>
              <option value="customer:asc">Customer A–Z</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
              {([["all", "All time"], ["today", "Today"], ["7d", "7 days"], ["30d", "30 days"], ["custom", "Dates"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => { setRange(k); setPage(1); }}
                  className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", range === k ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground")}
                >
                  {label}
                </button>
              ))}
            </div>
            {range === "custom" && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <label className="flex items-center gap-1.5 text-muted">From
                  <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-9 rounded-lg border border-border bg-surface px-2 text-foreground outline-none focus:border-brand-500" />
                </label>
                <label className="flex items-center gap-1.5 text-muted">To
                  <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-9 rounded-lg border border-border bg-surface px-2 text-foreground outline-none focus:border-brand-500" />
                </label>
              </div>
            )}
          </div>
        </div>

        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={tab === "completed" ? Wallet : CheckCircle2}
            title={tab === "completed" ? "No payments found" : "Nothing pending"}
            desc={query || method !== "all" || range !== "all" ? "Try a different search or date range." : tab === "completed" ? "Payments you confirm will appear here." : "Every order is paid up."}
          />
        ) : (
          <>
            {/* desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm [&_td]:px-3 [&_th]:px-3 lg:[&_td]:px-4 lg:[&_th]:px-4">
                <thead className="bg-surface-2/60 text-left text-xs uppercase tracking-wide text-muted">
                  <tr className="border-b border-border">
                    <th className="py-3 font-semibold">#</th>
                    {th("date", "Date")}
                    <th className="py-3 font-semibold">Order</th>
                    {th("customer", "Name")}
                    <th className="py-3 font-semibold">Transaction ID</th>
                    {th("amount", "Amount", "text-right")}
                    <th className="py-3 font-semibold">Paybill / Till</th>
                    <th className="py-3 font-semibold">Phone number</th>
                    <th className="py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r, i) => (
                    <tr key={r.key} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                      <td className="py-3 text-muted tabular-nums">{(page - 1) * 15 + i + 1}</td>
                      <td className="whitespace-nowrap py-3 tabular-nums">{fmtDate(r.at)}</td>
                      <td className="py-3"><Link href={`/admin/orders/${r.order.id}`} className="whitespace-nowrap font-medium text-brand-600 hover:underline">{r.order.number}</Link></td>
                      <td className="max-w-[12rem] truncate py-3 font-medium">{r.order.customer.name}</td>
                      <td className="py-3">
                        {r.code ? (
                          <span className="font-mono text-[13px] font-semibold">{r.code}{tab === "pending" && <span className="ml-1 font-sans text-[11px] font-normal text-amber-600">unverified</span>}</span>
                        ) : (
                          <span className="text-muted">{r.method === "Cash" ? "Cash" : "—"}</span>
                        )}
                      </td>
                      <td className={cn("whitespace-nowrap py-3 text-right font-semibold tabular-nums", tab === "completed" && "text-emerald-600 dark:text-emerald-400")}>{formatPrice(r.amount)}</td>
                      <td className="whitespace-nowrap py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", r.method === "M-Pesa" ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/12 text-amber-700 dark:text-amber-300")}>
                          {r.method === "M-Pesa" ? <Smartphone size={12} /> : <Banknote size={12} />}
                          {r.method === "M-Pesa" ? (till ? `Till ${till}` : "M-Pesa") : "Cash"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 tabular-nums">{r.order.customer.phone ? <a href={`tel:${r.order.customer.phone}`} className="hover:text-brand-600">{r.order.customer.phone}</a> : "—"}</td>
                      <td className="py-3">{actionCell(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* phone: cards */}
            <ul className="divide-y divide-border md:hidden">
              {slice.map((r) => (
                <li key={r.key} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.order.customer.name}</p>
                      <p className="text-xs text-muted tabular-nums">{fmtDate(r.at)}</p>
                    </div>
                    <span className={cn("shrink-0 font-display text-lg font-bold tabular-nums", tab === "completed" && "text-emerald-600 dark:text-emerald-400")}>{formatPrice(r.amount)}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <dt className="text-muted">Transaction ID</dt>
                    <dd className="truncate text-right font-mono font-semibold">{r.code ?? (r.method === "Cash" ? "Cash" : "—")}{r.code && tab === "pending" && <span className="ml-1 font-sans font-normal text-amber-600">unverified</span>}</dd>
                    <dt className="text-muted">Paybill / Till</dt>
                    <dd className="text-right">{r.method === "M-Pesa" ? (till ? `Till ${till}` : "M-Pesa") : "Cash"}</dd>
                    <dt className="text-muted">Phone</dt>
                    <dd className="text-right tabular-nums">{r.order.customer.phone ? <a href={`tel:${r.order.customer.phone}`}>{r.order.customer.phone}</a> : "—"}</dd>
                    <dt className="text-muted">Order</dt>
                    <dd className="text-right"><Link href={`/admin/orders/${r.order.id}`} className="font-medium text-brand-600">{r.order.number}</Link></dd>
                  </dl>
                  {actionCell(r)}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-sm text-muted">
                {rows.length} {rows.length === 1 ? "payment" : "payments"} · <b className="text-foreground tabular-nums">{formatPrice(total)}</b>
              </p>
              <Pagination page={page} pages={pages} setPage={setPage} total={rows.length} />
            </div>
          </>
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

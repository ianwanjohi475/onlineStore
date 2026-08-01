"use client";

import { ArrowUpDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Card, EmptyState, PageHeader, Pagination, SearchInput, StatusPill, Toggle, api, usePaginated,
} from "@/components/admin/kit";
import { useLive } from "@/hooks/use-live";
import { ORDER_STATUSES, PAYMENT_STATUSES, titleCase } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type SortKey = "date" | "total" | "number";

export default function OrdersAdmin() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = () => api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);
  useLive(load);

  const filtered = useMemo(() => {
    let list = (orders ?? []).filter((o) => (showArchived ? true : !o.archived));
    if (status !== "all") list = list.filter((o) => o.status === status);
    if (payment !== "all") list = list.filter((o) => o.paymentStatus === payment);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((o) =>
      o.number.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      (o.transactionId ?? "").toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      let d = 0;
      if (sort === "date") d = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sort === "total") d = a.total - b.total;
      else d = a.number.localeCompare(b.number);
      return asc ? d : -d;
    });
    return list;
  }, [orders, query, status, payment, sort, asc, showArchived]);

  const { slice, page, pages, setPage } = usePaginated(filtered, 12);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setAsc((a) => !a);
    else { setSort(key); setAsc(false); }
  };

  const selectCls = "h-10 rounded-lg border border-border bg-surface px-3 text-sm capitalize outline-none focus:border-brand-500";

  return (
    <div>
      <PageHeader title="Orders" subtitle={orders ? `${filtered.length} of ${orders.length} orders` : "Loading…"} />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Order #, customer or transaction" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectCls}>
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <div className="ml-auto"><Toggle label="Show archived" checked={showArchived} onChange={setShowArchived} /></div>
      </Card>

      <Card>
        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" desc="Orders placed at checkout appear here automatically." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-semibold"><SortBtn label="Order" active={sort === "number"} onClick={() => toggleSort("number")} /></th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell"><SortBtn label="Date" active={sort === "date"} onClick={() => toggleSort("date")} /></th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold"><SortBtn label="Total" active={sort === "total"} onClick={() => toggleSort("total")} right /></th>
                </tr>
              </thead>
              <tbody>
                {slice.map((o) => (
                  <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-2">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400">{o.number}</Link>
                      {o.archived && <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[0.6rem] text-muted">archived</span>}
                    </td>
                    <td className="px-5 py-3"><p className="font-medium">{o.customer.name}</p><p className="text-xs text-muted">{o.customer.city || o.customer.email}</p></td>
                    <td className="hidden px-5 py-3 text-muted md:table-cell">{new Date(o.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="hidden px-5 py-3 sm:table-cell"><div className="flex flex-col items-start gap-1"><span className="text-xs text-muted">{o.payment}</span><StatusPill status={o.paymentStatus} /></div></td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
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

function SortBtn({ label, active, onClick, right }: { label: string; active: boolean; onClick: () => void; right?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground ${active ? "text-foreground" : ""} ${right ? "flex-row-reverse" : ""}`}>
      {label} <ArrowUpDown size={12} className={active ? "text-brand-500" : "opacity-40"} />
    </button>
  );
}

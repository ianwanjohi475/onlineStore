"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Btn, Card, Drawer, EmptyState, PageHeader, Pagination, SearchInput, Select,
  StatusPill, api, usePaginated,
} from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersAdmin() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState<Order | null>(null);

  const load = () => api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      const q = query.toLowerCase();
      return !q || o.number.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q);
    });
  }, [orders, query, status]);

  const { slice, page, pages, setPage } = usePaginated(filtered, 10);

  const setStatusFor = async (o: Order, s: OrderStatus) => {
    await api("/api/admin/orders", "PUT", { id: o.id, status: s });
    toast(`Order marked ${s}`);
    setOpen(open ? { ...open, status: s } : null);
    load();
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle={orders ? `${orders.length} total orders` : "Loading…"} />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search order # or customer" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </Card>

      <Card>
        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" desc="Orders placed at checkout will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((o) => (
                  <tr key={o.id} onClick={() => setOpen(o)} className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-2">
                    <td className="px-5 py-3 font-medium">{o.number}</td>
                    <td className="px-5 py-3"><p className="font-medium">{o.customer.name}</p><p className="text-xs text-muted">{o.customer.city}</p></td>
                    <td className="hidden px-5 py-3 text-muted sm:table-cell">{new Date(o.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</td>
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

      <Drawer open={!!open} title={open?.number ?? ""} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <StatusPill status={open.status} />
              <span className="text-sm text-muted">{new Date(open.date).toLocaleString("en-KE")}</span>
            </div>

            <Select label="Update status" value={open.status} onChange={(e) => setStatusFor(open, e.target.value as OrderStatus)}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </Select>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Customer</p>
              <div className="rounded-xl border border-border p-4 text-sm">
                <p className="font-medium">{open.customer.name}</p>
                <p className="text-muted">{open.customer.email}</p>
                <p className="text-muted">{open.customer.phone}</p>
                <p className="text-muted">{open.customer.address}, {open.customer.city}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Items</p>
              <div className="divide-y divide-border rounded-xl border border-border">
                {open.items.map((it) => (
                  <div key={it.slug} className="flex items-center justify-between p-3 text-sm">
                    <span>{it.name} <span className="text-muted">× {it.quantity}</span></span>
                    <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(open.subtotal)}</span></div>
              {open.discount > 0 && <div className="flex justify-between text-brand-600 dark:text-brand-400"><span>Discount</span><span>−{formatPrice(open.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{open.shipping === 0 ? "Free" : formatPrice(open.shipping)}</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span>{formatPrice(open.total)}</span></div>
              <p className="mt-2 text-xs text-muted">Paid via {open.payment}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

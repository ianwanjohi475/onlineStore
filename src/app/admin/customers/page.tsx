"use client";

import { Mail, MapPin, Phone, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Btn, Card, Drawer, EmptyState, PageHeader, Pagination, SearchInput, StatusPill, api, usePaginated,
} from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import { useLive } from "@/hooks/use-live";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Customer {
  name: string; email: string; phone: string; city: string; address: string;
  orders: Order[]; spent: number; last: string; first: string;
}

export default function CustomersAdmin() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [suspended, setSuspended] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Customer | null>(null);

  const loadSuspended = () => api("/api/admin/customers", "GET").then((r) => setSuspended(r.suspended ?? [])).catch(() => {});
  const load = () => {
    api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
    loadSuspended();
  };
  useEffect(() => { load(); }, []);
  useLive(load);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders ?? []) {
      const key = o.customer.email || o.customer.name;
      const c = map.get(key) ?? { ...o.customer, orders: [], spent: 0, last: o.date, first: o.date };
      c.orders.push(o);
      if (o.status !== "cancelled" && o.status !== "refunded") c.spent += o.total;
      if (new Date(o.date) > new Date(c.last)) c.last = o.date;
      if (new Date(o.date) < new Date(c.first)) c.first = o.date;
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });
  const { slice, page, pages, setPage } = usePaginated(filtered, 12);

  const isSuspended = (email: string) => suspended.includes(email);

  const toggleSuspend = async (c: Customer) => {
    const next = !isSuspended(c.email);
    await api("/api/admin/customers", "PUT", { email: c.email, suspended: next }).catch(() => {});
    toast(next ? `${c.name} suspended` : `${c.name} reactivated`);
    loadSuspended();
  };

  return (
    <div>
      <PageHeader title="Customers" subtitle={orders ? `${customers.length} customers` : "Loading…"} />
      <Card className="mb-4 p-3"><SearchInput value={query} onChange={setQuery} placeholder="Search name or email" /></Card>

      <Card>
        {orders === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" desc="Customers appear after their first order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">City</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 text-right font-semibold">Spent</th>
                  <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((c) => (
                  <tr key={c.email} onClick={() => setOpen(c)} className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-2">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-brand-500/12 text-sm font-bold text-brand-700 dark:text-brand-300">{c.name[0]}</span>
                        <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-muted sm:table-cell">{c.city}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums">{c.orders.length}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(c.spent)}</td>
                    <td className="hidden px-5 py-3 text-right md:table-cell"><StatusPill status={isSuspended(c.email) ? "suspended" : c.orders.length > 1 ? "active" : "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-border p-4"><Pagination page={page} pages={pages} setPage={setPage} total={filtered.length} /></div>
          </div>
        )}
      </Card>

      <Drawer open={!!open} title={open?.name ?? ""} onClose={() => setOpen(null)}
        footer={open && (
          <Btn variant={isSuspended(open.email) ? "primary" : "danger"} className="w-full" onClick={() => toggleSuspend(open)}>
            {isSuspended(open.email) ? "Reactivate account" : "Suspend account"}
          </Btn>
        )}>
        {open && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-brand-500/12 text-lg font-bold text-brand-700 dark:text-brand-300">{open.name[0]}</span>
              <div>
                <p className="font-semibold">{open.name}</p>
                <StatusPill status={isSuspended(open.email) ? "suspended" : open.orders.length > 1 ? "active" : "pending"} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Metric label="Orders" value={String(open.orders.length)} />
              <Metric label="Total spent" value={formatPrice(open.spent)} />
              <Metric label="Avg. order" value={formatPrice(Math.round(open.spent / Math.max(1, open.orders.filter((o) => o.status !== "cancelled").length)))} />
            </div>

            <div className="rounded-xl border border-border p-4 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Contact</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-muted" /> {open.email || "—"}</p>
              <p className="mt-1 flex items-center gap-2"><Phone size={14} className="text-muted" /> {open.phone || "—"}</p>
              <p className="mt-1 flex items-center gap-2"><MapPin size={14} className="text-muted" /> {open.address}, {open.city}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Order history</p>
              <div className="divide-y divide-border rounded-xl border border-border">
                {[...open.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-3 text-sm hover:bg-surface-2">
                    <div>
                      <p className="font-medium">{o.number}</p>
                      <p className="text-xs text-muted">{new Date(o.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={o.status} />
                      <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="font-display text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

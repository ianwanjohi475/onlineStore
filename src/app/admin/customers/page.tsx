"use client";

import { Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, EmptyState, PageHeader, Pagination, SearchInput, StatusPill, api, usePaginated } from "@/components/admin/kit";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Customer {
  name: string; email: string; phone: string; city: string;
  orders: number; spent: number; last: string;
}

export default function CustomersAdmin() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([])); }, []);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders ?? []) {
      const key = o.customer.email || o.customer.name;
      const c = map.get(key) ?? { ...o.customer, orders: 0, spent: 0, last: o.date };
      c.orders += 1;
      if (o.status !== "cancelled") c.spent += o.total;
      if (new Date(o.date) > new Date(c.last)) c.last = o.date;
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });
  const { slice, page, pages, setPage } = usePaginated(filtered, 10);

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
                  <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">Type</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((c) => (
                  <tr key={c.email} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-brand-500/12 text-sm font-bold text-brand-700 dark:text-brand-300">{c.name[0]}</span>
                        <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-muted sm:table-cell">{c.city}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums">{c.orders}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(c.spent)}</td>
                    <td className="hidden px-5 py-3 text-right md:table-cell"><StatusPill status={c.orders > 1 ? "active" : "pending"} /></td>
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

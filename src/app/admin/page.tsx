"use client";

import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Card, PageHeader, StatCard, StatusPill, api } from "@/components/admin/kit";
import type { Order, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
    api("/api/admin/products", "GET").then(setProducts).catch(() => setProducts([]));
  }, []);

  const m = useMemo(() => {
    if (!orders) return null;
    const paid = orders.filter((o) => o.status !== "cancelled");
    const revenue = paid.reduce((n, o) => n + o.total, 0);
    const aov = paid.length ? revenue / paid.length : 0;
    const customers = new Set(orders.map((o) => o.customer.email)).size;
    // revenue by month (last 6)
    const now = new Date();
    const buckets: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en", { month: "short" });
      const total = paid
        .filter((o) => { const od = new Date(o.date); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); })
        .reduce((n, o) => n + o.total, 0);
      buckets.push({ label, total });
    }
    return { revenue, aov, customers, orders: orders.length, buckets };
  }, [orders]);

  const lowStock = (products ?? []).filter((p) => (p.stock ?? 0) <= 5).slice(0, 6);
  const recent = (orders ?? []).slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your store at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={m ? formatPrice(m.revenue) : "—"} icon={DollarSign} delta={{ value: "12.4%", up: true }} spark={m?.buckets.map((b) => b.total)} />
        <StatCard label="Orders" value={m ? String(m.orders) : "—"} icon={ShoppingCart} delta={{ value: "8.1%", up: true }} />
        <StatCard label="Customers" value={m ? String(m.customers) : "—"} icon={Users} delta={{ value: "5.3%", up: true }} />
        <StatCard label="Avg. order" value={m ? formatPrice(Math.round(m.aov)) : "—"} icon={Package} delta={{ value: "1.2%", up: false }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Revenue</h2>
              <p className="text-sm text-muted">Last 6 months</p>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">{m ? formatPrice(m.revenue) : "—"}</span>
          </div>
          {m ? <BarChart data={m.buckets.map((b) => b.total)} labels={m.buckets.map((b) => b.label)} /> : <div className="h-44 animate-pulse rounded-xl bg-surface-2" />}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-display text-lg font-bold">Low stock</h2>
          </div>
          {products === null ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-2" />)}</div>
          ) : lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Everything is well stocked 👍</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {lowStock.map((p) => (
                <Link key={p.slug} href="/admin/products" className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600 dark:hover:text-brand-400">
                  <span className="truncate">{p.name}</span>
                  <span className={`shrink-0 font-semibold ${(p.stock ?? 0) === 0 ? "text-rose-500" : "text-amber-600"}`}>{p.stock ?? 0} left</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders === null ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-border"><td colSpan={4} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-surface-2" /></td></tr>)
              ) : recent.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{o.number}</td>
                  <td className="px-5 py-3 text-muted">{o.customer.name}</td>
                  <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

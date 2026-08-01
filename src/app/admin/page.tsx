"use client";

import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Card, PageHeader, StatCard, StatusPill, api } from "@/components/admin/kit";
import { useLive } from "@/hooks/use-live";
import { CANCELLED_STATUSES, COMPLETED_STATUSES, OPEN_STATUSES } from "@/lib/orders";
import type { Order, Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const load = () => {
    api("/api/admin/orders", "GET").then(setOrders).catch(() => setOrders([]));
    api("/api/admin/products", "GET").then(setProducts).catch(() => setProducts([]));
  };
  useEffect(() => { load(); }, []);
  useLive(load);

  const m = useMemo(() => {
    if (!orders) return null;
    const valid = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
    const revenue = valid.reduce((n, o) => n + o.total, 0);
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const todayRevenue = valid.filter((o) => new Date(o.date) >= startToday).reduce((n, o) => n + o.total, 0);
    const customers = new Set(orders.map((o) => o.customer.email)).size;

    const pending = orders.filter((o) => OPEN_STATUSES.includes(o.status)).length;
    const completed = orders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length;
    const cancelled = orders.filter((o) => CANCELLED_STATUSES.includes(o.status)).length;
    const paidPayments = orders.filter((o) => o.paymentStatus === "paid").length;
    const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").length;

    const now = new Date();
    const buckets: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = valid
        .filter((o) => { const od = new Date(o.date); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); })
        .reduce((n, o) => n + o.total, 0);
      buckets.push({ label: d.toLocaleString("en", { month: "short" }), total });
    }

    const units = new Map<string, { name: string; qty: number }>();
    for (const o of valid) for (const it of o.items) {
      const e = units.get(it.slug) ?? { name: it.name, qty: 0 };
      e.qty += it.quantity;
      units.set(it.slug, e);
    }
    const bestSellers = [...units.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    return { revenue, todayRevenue, customers, orders: orders.length, pending, completed, cancelled, paidPayments, pendingPayments, buckets, bestSellers };
  }, [orders]);

  const lowStock = (products ?? []).filter((p) => (p.stock ?? 0) <= 5).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 5);
  const recent = (orders ?? []).slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your store at a glance" />

      {/* four headline KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={m ? formatPrice(m.revenue) : "—"} icon={DollarSign} hint="Paid & fulfilled orders" />
        <StatCard label="Today's revenue" value={m ? formatPrice(m.todayRevenue) : "—"} icon={TrendingUp} hint="Since midnight" />
        <StatCard label="Orders" value={m ? String(m.orders) : "—"} icon={ShoppingCart} hint="All time" />
        <StatCard label="Customers" value={m ? String(m.customers) : "—"} icon={Users} hint="Unique buyers" />
      </div>

      {/* revenue chart + a compact status summary */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Revenue</h2>
              <p className="text-sm text-muted">Last 6 months</p>
            </div>
            <span className="text-xl font-bold tabular-nums">{m ? formatPrice(m.revenue) : "—"}</span>
          </div>
          {m ? <BarChart data={m.buckets.map((b) => b.total)} labels={m.buckets.map((b) => b.label)} /> : <div className="h-44 animate-pulse rounded-xl bg-surface-2" />}
        </Card>

        <Card className="flex flex-col p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Order status</h2>
          <div className="flex flex-col gap-3">
            <StatusRow color="bg-amber-500" label="Pending" value={m?.pending} href="/admin/orders" />
            <StatusRow color="bg-brand-500" label="Completed" value={m?.completed} href="/admin/orders" />
            <StatusRow color="bg-rose-500" label="Cancelled" value={m?.cancelled} href="/admin/orders" />
          </div>
          <div className="my-4 border-t border-border" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Payments</p>
          <div className="flex flex-col gap-3">
            <StatusRow color="bg-brand-500" label="Paid" value={m?.paidPayments} href="/admin/payments" />
            <StatusRow color="bg-amber-500" label="Pending" value={m?.pendingPayments} href="/admin/payments" />
          </div>
        </Card>
      </div>

      {/* recent orders + a slim sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card>
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
                ) : recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-muted">No orders yet.</td></tr>
                ) : recent.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">{o.number}</Link></td>
                    <td className="px-5 py-3 text-muted">{o.customer.name}</td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-500" />
              <h2 className="font-display text-lg font-bold">Low stock</h2>
            </div>
            {products === null ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-2" />)}</div>
            ) : lowStock.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">Everything is well stocked 👍</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {lowStock.map((p) => (
                  <Link key={p.slug} href="/admin/products" className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600 dark:hover:text-brand-400">
                    <span className="truncate pr-3">{p.name}</span>
                    <span className={cn("shrink-0 font-semibold tabular-nums", (p.stock ?? 0) === 0 ? "text-rose-500" : "text-amber-600")}>{p.stock ?? 0} left</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package size={17} className="text-brand-500" />
              <h2 className="font-display text-lg font-bold">Best sellers</h2>
            </div>
            {m ? (m.bestSellers.length === 0 ? <p className="py-4 text-center text-sm text-muted">No sales yet.</p> : (
              <div className="flex flex-col divide-y divide-border">
                {m.bestSellers.map((e, i) => (
                  <div key={e.name} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2.5 truncate pr-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/12 text-[0.65rem] font-bold text-brand-700 dark:text-brand-300">{i + 1}</span><span className="truncate">{e.name}</span></span>
                    <span className="shrink-0 font-semibold tabular-nums">{e.qty}</span>
                  </div>
                ))}
              </div>
            )) : <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-surface-2" />)}</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ color, label, value, href }: { color: string; label: string; value?: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between text-sm transition-colors hover:text-brand-600 dark:hover:text-brand-400">
      <span className="flex items-center gap-2.5"><span className={cn("size-2 rounded-full", color)} /> {label}</span>
      <span className="text-base font-bold tabular-nums">{value ?? "—"}</span>
    </Link>
  );
}

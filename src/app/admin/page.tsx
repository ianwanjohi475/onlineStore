"use client";

import {
  AlertTriangle, CheckCircle2, Clock, DollarSign, Package, ShoppingCart,
  TrendingUp, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Card, PageHeader, StatCard, StatusPill, api } from "@/components/admin/kit";
import { CANCELLED_STATUSES, COMPLETED_STATUSES, OPEN_STATUSES } from "@/lib/orders";
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
    const valid = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
    const revenue = valid.reduce((n, o) => n + o.total, 0);
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const todayRevenue = valid.filter((o) => new Date(o.date) >= startToday).reduce((n, o) => n + o.total, 0);
    const customers = new Set(orders.map((o) => o.customer.email)).size;

    const pendingOrders = orders.filter((o) => OPEN_STATUSES.includes(o.status)).length;
    const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length;
    const cancelledOrders = orders.filter((o) => CANCELLED_STATUSES.includes(o.status)).length;
    const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").length;
    const completedPayments = orders.filter((o) => o.paymentStatus === "paid").length;

    const now = new Date();
    const buckets: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = valid
        .filter((o) => { const od = new Date(o.date); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); })
        .reduce((n, o) => n + o.total, 0);
      buckets.push({ label: d.toLocaleString("en", { month: "short" }), total });
    }

    // best sellers by units sold
    const units = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of valid) for (const it of o.items) {
      const e = units.get(it.slug) ?? { name: it.name, qty: 0, revenue: 0 };
      e.qty += it.quantity; e.revenue += it.price * it.quantity;
      units.set(it.slug, e);
    }
    const bestSellers = [...units.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

    // latest customers by first-seen order date
    const firstSeen = new Map<string, { name: string; email: string; date: string }>();
    for (const o of [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
      const key = o.customer.email || o.customer.name;
      if (!firstSeen.has(key)) firstSeen.set(key, { name: o.customer.name, email: o.customer.email, date: o.date });
    }
    const latestCustomers = [...firstSeen.values()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return { revenue, todayRevenue, customers, orders: orders.length, pendingOrders, completedOrders, cancelledOrders, pendingPayments, completedPayments, buckets, bestSellers, latestCustomers };
  }, [orders]);

  const lowStock = (products ?? []).filter((p) => (p.stock ?? 0) <= 5).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 6);
  const recent = (orders ?? []).slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your store at a glance" />

      {/* headline stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={m ? formatPrice(m.revenue) : "—"} icon={DollarSign} spark={m?.buckets.map((b) => b.total)} />
        <StatCard label="Today's revenue" value={m ? formatPrice(m.todayRevenue) : "—"} icon={TrendingUp} />
        <StatCard label="Total orders" value={m ? String(m.orders) : "—"} icon={ShoppingCart} />
        <StatCard label="Customers" value={m ? String(m.customers) : "—"} icon={Users} />
      </div>

      {/* status breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MiniStat label="Pending orders" value={m?.pendingOrders} icon={Clock} tone="amber" href="/admin/orders" />
        <MiniStat label="Completed" value={m?.completedOrders} icon={CheckCircle2} tone="brand" href="/admin/orders" />
        <MiniStat label="Cancelled" value={m?.cancelledOrders} icon={XCircle} tone="rose" href="/admin/orders" />
        <MiniStat label="Pending payments" value={m?.pendingPayments} icon={Clock} tone="amber" href="/admin/payments" />
        <MiniStat label="Paid payments" value={m?.completedPayments} icon={DollarSign} tone="brand" href="/admin/payments" />
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* recent orders */}
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
          {/* best sellers */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><Package size={17} className="text-brand-500" /><h2 className="font-display text-lg font-bold">Best sellers</h2></div>
            {m ? (m.bestSellers.length === 0 ? <p className="py-4 text-center text-sm text-muted">No sales yet.</p> : (
              <div className="flex flex-col divide-y divide-border">
                {m.bestSellers.map(([slug, e], i) => (
                  <div key={slug} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2.5 truncate"><span className="grid size-6 place-items-center rounded-full bg-brand-500/12 text-xs font-bold text-brand-700 dark:text-brand-300">{i + 1}</span><span className="truncate">{e.name}</span></span>
                    <span className="shrink-0 font-semibold tabular-nums">{e.qty} sold</span>
                  </div>
                ))}
              </div>
            )) : <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-surface-2" />)}</div>}
          </Card>

          {/* latest customers */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><Users size={17} className="text-brand-500" /><h2 className="font-display text-lg font-bold">Latest customers</h2></div>
            {m ? (m.latestCustomers.length === 0 ? <p className="py-4 text-center text-sm text-muted">No customers yet.</p> : (
              <div className="flex flex-col divide-y divide-border">
                {m.latestCustomers.map((c) => (
                  <div key={c.email || c.name} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2.5 truncate"><span className="grid size-7 place-items-center rounded-full bg-brand-500/12 text-xs font-bold text-brand-700 dark:text-brand-300">{c.name[0]}</span><span className="truncate">{c.name}</span></span>
                    <span className="shrink-0 text-xs text-muted">{new Date(c.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</span>
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

function MiniStat({ label, value, icon: Icon, tone, href }: { label: string; value?: number; icon: React.ComponentType<{ size?: number; className?: string }>; tone: "brand" | "amber" | "rose"; href: string }) {
  const toneCls = { brand: "text-brand-600 dark:text-brand-400 bg-brand-500/12", amber: "text-amber-600 bg-amber-500/12", rose: "text-rose-500 bg-rose-500/12" }[tone];
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-brand-500/40">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneCls}`}><Icon size={17} /></span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold tabular-nums">{value ?? "—"}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

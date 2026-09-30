"use client";

import { Loader2, Package, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OrderCard } from "@/components/orders/order-card";
import { useMyOrders } from "@/hooks/use-my-orders";
import type { PublicOrder } from "@/lib/order-public";

/**
 * "My orders" — every order placed on this device is listed with a live
 * delivery tracker (Amazon "Your Orders" style). Nothing to type or remember.
 * Orders placed on another phone can still be found by order number.
 */
export default function MyOrdersPage() {
  const my = useMyOrders();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [number, setNumber] = useState("");
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState("");
  const [found, setFound] = useState<PublicOrder | null>(null);

  const numbers = my.orders.map((o) => o.number).join(",");

  const load = useCallback(async () => {
    if (!numbers) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/my-orders?numbers=${encodeURIComponent(numbers)}`, { cache: "no-store" });
      const d = await res.json();
      setOrders(Array.isArray(d.orders) ? d.orders : []);
    } catch {
      /* keep what we have */
    } finally {
      setLoading(false);
    }
  }, [numbers]);

  // load once the saved list is read, then refresh when the shopper comes back to the tab
  useEffect(() => {
    if (!my.hydrated) return;
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    const id = setInterval(load, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, [my.hydrated, load]);

  // ?number=SVE-123456 (links from SMS / WhatsApp) → look it up straight away
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("number");
    if (n) void find(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const find = async (value: string) => {
    const v = value.trim();
    if (!v) return;
    setNumber(v);
    setFinding(true);
    setError("");
    setFound(null);
    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(v)}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "We couldn't find that order.");
      setFound(d);
      my.add(d.number); // remember it on this device from now on
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setFinding(false);
    }
  };

  const list = found ? [found, ...orders.filter((o) => o.number !== found.number)] : orders;

  return (
    <div className="container-x max-w-3xl py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">My orders</h1>
          <p className="mt-1 text-sm text-muted">Track every order from this phone or computer — no order number needed.</p>
        </div>
        {orders.length > 0 && (
          <button onClick={() => { setLoading(true); void load(); }} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-2">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {!my.hydrated || (loading && list.length === 0 && numbers) ? (
          [0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2" />)
        ) : list.length > 0 ? (
          list.map((o, i) => <OrderCard key={o.number} order={o} defaultOpen={i === 0 && list.length === 1} />)
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10"><Package size={26} /></span>
            <p className="font-semibold">No orders on this device yet</p>
            <p className="max-w-sm text-sm text-muted">When you place an order it appears here automatically with live delivery tracking.</p>
            <Link href="/shop" className="mt-1 rounded-full bg-cta px-6 py-2.5 text-sm font-bold text-white hover:bg-cta-600">Start shopping</Link>
          </div>
        )}
      </div>

      {/* find an order placed on another device */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold">Ordered on another phone?</p>
        <p className="text-xs text-muted">Enter the order number from your SMS or WhatsApp confirmation.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); void find(number); }}
          className="mt-3 flex gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4">
            <Search size={16} className="shrink-0 text-muted" />
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. SVE-123456"
              aria-label="Order number"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm uppercase outline-none placeholder:normal-case"
            />
          </div>
          <button type="submit" disabled={finding} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-cta px-5 text-sm font-bold text-white hover:bg-cta-600 disabled:opacity-60">
            {finding ? <Loader2 size={16} className="animate-spin" /> : "Find"}
          </button>
        </form>
        {error && <p className="mt-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    </div>
  );
}

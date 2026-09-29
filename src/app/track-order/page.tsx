"use client";

import { CheckCircle2, Circle, Loader2, MapPin, Package, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMyOrders } from "@/hooks/use-my-orders";
import { formatPrice } from "@/lib/utils";

interface TrackResult {
  number: string;
  status: string;
  paymentStatus: string;
  date: string;
  total: number;
  timeline: { at: string; label: string; by?: string }[];
}

// The four delivery milestones a shopper follows, and which order statuses map to each.
const stages = [
  { icon: CheckCircle2, title: "Order confirmed", detail: "We received your order", statuses: ["pending", "confirmed", "processing"] },
  { icon: Package, title: "Packed & ready", detail: "Packed at our Nairobi hub", statuses: ["packed"] },
  { icon: Truck, title: "On the way", detail: "Out for delivery to your address", statuses: ["shipped", "out-for-delivery"] },
  { icon: MapPin, title: "Delivered", detail: "Handed to you", statuses: ["delivered"] },
];

function stageIndexFor(status: string): number {
  const i = stages.findIndex((s) => s.statuses.includes(status));
  if (status === "delivered") return stages.length - 1;
  return i === -1 ? 0 : i;
}

const badgeFor: Record<string, string> = {
  delivered: "bg-brand-500/15 text-brand-700 dark:text-brand-300",
  cancelled: "bg-rose-500/15 text-rose-500",
  refunded: "bg-rose-500/15 text-rose-500",
  returned: "bg-rose-500/15 text-rose-500",
};

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const myOrders = useMyOrders();

  // Arriving from "Track" elsewhere (e.g. /account) — look it up automatically.
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("number");
    if (n) void lookup(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookup(number);
  };

  const lookup = async (value: string) => {
    if (!value.trim()) return;
    setNumber(value);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/track?number=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn't find that order.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStage = result ? stageIndexFor(result.status) : -1;
  const terminal = result && ["cancelled", "refunded", "returned"].includes(result.status);

  return (
    <div className="container-x max-w-2xl py-14">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Track your <span className="text-brand-600 dark:text-brand-400">order</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Orders you place on this device show up below — no need to remember the number.
        </p>
      </div>

      {/* Orders placed on this device — one click to track, nothing to memorise */}
      {myOrders.hydrated && myOrders.orders.length > 0 && (
        <div className="card-surface mt-7 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Your recent orders</p>
          <div className="flex flex-wrap gap-2">
            {myOrders.orders.map((o) => (
              <button
                key={o.number}
                onClick={() => lookup(o.number.replace("#", ""))}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
              >
                {o.number}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={track} className="card-surface mt-7 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="SVE-123456"
            className="h-11 w-full flex-1 bg-transparent uppercase outline-none placeholder:normal-case"
          />
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Tracking…</> : "Track order"}
        </Button>
      </form>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">{error}</div>
      )}

      {result && (
        <div className="card-surface mt-5 p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="font-semibold">Order {result.number}</p>
              <p className="text-xs text-muted">
                Placed {new Date(result.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })} · {formatPrice(result.total)}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeFor[result.status] ?? "bg-amber-400/15 text-amber-600"}`}>
              {result.status.replace(/-/g, " ")}
            </span>
          </div>

          {terminal ? (
            <p className="mt-5 text-sm text-muted">This order was {result.status}. If you have questions, reach us on WhatsApp and we&apos;ll help right away.</p>
          ) : (
            <ol className="mt-6 space-y-6">
              {stages.map((step, i) => {
                const done = i <= currentStage;
                const active = i === currentStage;
                return (
                  <li key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`grid size-10 place-items-center rounded-full ${done ? "bg-brand-500/15 text-brand-600 dark:text-brand-400" : "bg-surface-2 text-muted"}`}>
                        {done ? <step.icon size={20} /> : <Circle size={20} />}
                      </span>
                      {i < stages.length - 1 && <span className={`mt-1 h-10 w-px ${done ? "bg-brand-500/40" : "bg-border"}`} />}
                    </div>
                    <div>
                      <p className={`font-semibold ${active ? "text-brand-600 dark:text-brand-400" : ""}`}>{step.title}</p>
                      <p className="text-sm text-muted">{step.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {!result && !error && (
        <p className="mt-6 text-center text-sm text-muted">
          Can&apos;t find your number? <Link href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact us</Link> and we&apos;ll look it up.
        </p>
      )}
    </div>
  );
}

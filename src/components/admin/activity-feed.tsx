"use client";

import { Download, LogIn, Search, Settings2, ShieldAlert, ShoppingCart, Smartphone, UserPlus, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Btn, api } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: number;
  at: string;
  kind: "order" | "payment" | "mpesa" | "customer" | "security" | "admin";
  level: "info" | "success" | "warning" | "error";
  message: string;
  ref: string | null;
  ip: string | null;
}

const KINDS = [
  ["", "All"],
  ["order", "Orders"],
  ["payment", "Payments"],
  ["mpesa", "M-Pesa"],
  ["customer", "Customers"],
  ["security", "Security"],
  ["admin", "Admin changes"],
] as const;

const ICON = { order: ShoppingCart, payment: Wallet, mpesa: Smartphone, customer: UserPlus, security: ShieldAlert, admin: Settings2 };
const TONE = {
  info: "bg-brand-500/12 text-brand-600 dark:text-brand-300",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  error: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
const fullDate = (iso: string) => new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

/** Link an entry to the order it's about (refs like "#SVE-AB12CD34"). */
function refHref(ref: string | null) {
  const m = ref?.match(/^#?(SVE-[A-Z0-9]{4,})$/);
  return m ? `/admin/orders/${m[1]}` : null;
}

/**
 * The store's activity log. `compact` is the dashboard version (latest
 * entries only); the full version adds filters, search, export and paging.
 * Refreshes itself every 10 seconds while the tab is visible.
 */
export function ActivityFeed({ compact = false, limit = compact ? 12 : 50 }: { compact?: boolean; limit?: number }) {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [more, setMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [appliedQ, setAppliedQ] = useState("");

  const url = useCallback(
    (before?: number) => `/api/admin/activity?limit=${limit}${kind ? `&kind=${kind}` : ""}${appliedQ ? `&q=${encodeURIComponent(appliedQ)}` : ""}${before ? `&before=${before}` : ""}`,
    [kind, limit, appliedQ],
  );

  const refresh = useCallback(async () => {
    const r = await api(url(), "GET").catch(() => null);
    if (!r) return;
    setItems((prev) => {
      // keep any older pages already loaded below the fresh first page
      const fresh: ActivityItem[] = r.items;
      if (!prev || compact) return fresh;
      const oldest = fresh.at(-1)?.id ?? Infinity;
      return [...fresh, ...prev.filter((p) => p.id < oldest)];
    });
  }, [url, compact]);

  useEffect(() => {
    let alive = true;
    api(url(), "GET")
      .then((r) => { if (alive) { setItems(r.items); setMore(r.items.length >= limit); } })
      .catch(() => alive && setItems([]));
    const t = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 10_000);
    return () => { alive = false; clearInterval(t); };
  }, [url, limit, refresh]);

  const loadMore = async () => {
    if (!items?.length) return;
    setLoadingMore(true);
    const r = await api(url(items.at(-1)!.id), "GET").catch(() => null);
    setLoadingMore(false);
    if (!r) return;
    setItems([...items, ...r.items]);
    setMore(r.items.length >= limit);
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim() === appliedQ) return void refresh();
    setItems(null);
    setAppliedQ(q.trim());
  };

  const exportCsv = () => {
    const rows = (items ?? []).map((a) => [fullDate(a.at), a.kind, a.level, a.message, a.ref ?? "", a.ip ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([["Date,Type,Level,Event,Reference,IP", ...rows].join("\n")], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href; a.download = `activity-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div>
      {!compact && (
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={search} className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, emails, order #" aria-label="Search activity"
                className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
            </form>
            <Btn variant="outline" size="sm" onClick={exportCsv} disabled={!items?.length}><Download size={14} /> Export</Btn>
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
            {KINDS.map(([k, label]) => (
              <button key={k || "all"} onClick={() => { if (k !== kind) { setKind(k); setItems(null); } }}
                className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", kind === k ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground")}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {items === null ? (
        <div className="space-y-2 p-4">{Array.from({ length: compact ? 5 : 8 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-lg bg-surface-2" />)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <LogIn size={22} className="text-muted" />
          <p className="font-medium">No activity yet</p>
          <p className="text-sm text-muted">Sign-ups, orders, payments and admin changes will appear here as they happen.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a) => {
            const Icon = ICON[a.kind] ?? Settings2;
            const href = refHref(a.ref);
            return (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", TONE[a.level] ?? TONE.info)}><Icon size={15} /></span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm leading-snug">{a.message}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <time dateTime={a.at} title={fullDate(a.at)}>{timeAgo(a.at)}</time>
                    {href && <Link href={href} className="font-medium text-brand-600 hover:underline">View order</Link>}
                    {!compact && a.ip && a.kind === "security" && <span>IP {a.ip}</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!compact && items && items.length > 0 && more && (
        <div className="border-t border-border p-3 text-center">
          <Btn variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load older activity"}</Btn>
        </div>
      )}
    </div>
  );
}

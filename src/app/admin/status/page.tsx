"use client";

import {
  ArrowRight, CheckCircle2, Database, HardDrive, Monitor, RefreshCw, ShieldAlert, ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Btn, Card, PageHeader, api } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

interface Health {
  backend: "database" | "file";
  connected: boolean;
  host: string | null;
  error: string | null;
  latencyMs: number;
  counts: { products: number; orders: number; customers: number; categories: number; brands: number };
  checkedAt: string;
}

export default function StatusPage() {
  const [h, setH] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/admin/health", "GET").then(setH).catch(() => setH(null)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const db = h?.backend === "database" && h.connected;
  const file = h?.backend === "file";
  const dbError = h?.backend === "database" && !h.connected;

  return (
    <div>
      <PageHeader
        title="System status"
        subtitle="Live health of your store's data connection"
        actions={<Btn variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</Btn>}
      />

      {/* headline status */}
      <Card className={cn("mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between", db ? "border-brand-500/40" : dbError ? "border-rose-500/40" : "border-amber-500/40")}>
        <div className="flex items-center gap-4">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl",
            db ? "bg-brand-500/12 text-brand-600 dark:text-brand-400" : dbError ? "bg-rose-500/12 text-rose-500" : "bg-amber-500/12 text-amber-600")}>
            {file ? <HardDrive size={26} /> : dbError ? <ShieldAlert size={26} /> : <Database size={26} />}
          </span>
          <div>
            <p className="font-display text-xl font-bold">
              {!h ? "Checking…" : db ? "Database connected" : dbError ? "Database unreachable" : "Using local file store"}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {db && h?.host ? h.host
                : dbError ? (h?.error ?? "Could not reach the database")
                : file ? "data/store.json — set DATABASE_URL to switch to your database"
                : "…"}
            </p>
          </div>
        </div>
        {h && (
          <span className={cn("inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-sm font-semibold sm:self-auto",
            db ? "bg-brand-500/12 text-brand-600 dark:text-brand-400" : dbError ? "bg-rose-500/12 text-rose-500" : "bg-amber-500/12 text-amber-600")}>
            <span className={cn("size-2 rounded-full", db ? "bg-brand-500" : dbError ? "bg-rose-500" : "bg-amber-500")} />
            {db ? `Live · ${h.latencyMs}ms` : dbError ? "Error" : "File mode"}
          </span>
        )}
      </Card>

      {/* live record counts (read straight from the live backend) */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Live records {db ? "in your database" : "in the file store"}</p>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Products", value: h?.counts.products },
          { label: "Orders", value: h?.counts.orders },
          { label: "Customers", value: h?.counts.customers },
          { label: "Categories", value: h?.counts.categories },
          { label: "Brands", value: h?.counts.brands },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-[1.7rem] font-bold leading-none tabular-nums">{h ? c.value : "—"}</p>
            <p className="mt-2 text-sm text-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* the data flow — proof everything is wired together */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">How your store is wired</h2>
        <p className="mt-1 text-sm text-muted">Every order flows through this chain automatically.</p>
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Flow icon={Monitor} title="Storefront" desc="Customer places an order" />
          <ArrowRight className="mx-auto hidden shrink-0 text-muted sm:block" size={20} />
          <Flow icon={file ? HardDrive : Database} title={file ? "File store" : "Database"} desc={db ? "Saved to CockroachDB" : file ? "Saved to data/store.json" : "Storage"} highlight />
          <ArrowRight className="mx-auto hidden shrink-0 text-muted sm:block" size={20} />
          <Flow icon={ShoppingCart} title="Admin" desc="Appears in Orders instantly" />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-2/50 p-4">
          <p className="mb-2 text-sm font-semibold">Prove it end-to-end in 30 seconds</p>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-muted">
            <li>Open the storefront, add a product to cart and check out.</li>
            <li>Come back here and press <b className="text-foreground">Refresh</b> — the <b className="text-foreground">Orders</b> count goes up.</li>
            <li>Check <b className="text-foreground">Admin → Orders</b>: the new order is there.{db ? <> And in your <b className="text-foreground">CockroachDB dashboard → Data</b>, the <code className="rounded bg-surface px-1">orders</code> table has the new row.</> : null}</li>
          </ol>
        </div>

        {file && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-muted">
              You&apos;re on the <b className="text-foreground">local file store</b>. It works, but data resets on redeploy and can&apos;t handle two orders at once.
              Set <code className="rounded bg-surface px-1">DATABASE_URL</code> in <code className="rounded bg-surface px-1">.env</code> to switch to your database (see <b className="text-foreground">DATABASE.md</b>).
            </p>
          </div>
        )}
        {db && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/5 p-4 text-sm">
            <CheckCircle2 size={18} className="shrink-0 text-brand-600 dark:text-brand-400" />
            <p className="text-muted">Everything is connected: storefront, database and admin are talking to the same live data.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Flow({ icon: Icon, title, desc, highlight }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; desc: string; highlight?: boolean }) {
  return (
    <div className={cn("flex flex-1 items-center gap-3 rounded-xl border p-4", highlight ? "border-brand-500/40 bg-brand-500/5" : "border-border")}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", highlight ? "bg-brand-500/12 text-brand-600 dark:text-brand-400" : "bg-surface-2 text-muted")}><Icon size={19} /></span>
      <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted">{desc}</p></div>
    </div>
  );
}

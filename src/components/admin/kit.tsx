"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* ── Page scaffolding ─────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  className,
  children,
  ...rest
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface", className)} {...rest}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-500/12 text-brand-600 dark:text-brand-400">
          <Icon size={17} />
        </span>
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-3.5 text-[1.7rem] font-bold leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 60},${20 - (d / max) * 18}`).join(" ");
  return (
    <svg viewBox="0 0 60 20" className={cn("h-5 w-16", className)} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--color-brand-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Status + badges ──────────────────────────────────────── */
const statusStyles: Record<string, string> = {
  // fulfilment
  delivered: "bg-brand-500/12 text-brand-600 dark:text-brand-400",
  "out-for-delivery": "bg-teal-500/12 text-teal-600 dark:text-teal-400",
  shipped: "bg-sky-500/12 text-sky-500",
  packed: "bg-indigo-500/12 text-indigo-500",
  processing: "bg-amber-500/12 text-amber-600",
  confirmed: "bg-violet-500/12 text-violet-500",
  pending: "bg-surface-2 text-muted",
  cancelled: "bg-rose-500/12 text-rose-500",
  refunded: "bg-orange-500/12 text-orange-500",
  returned: "bg-fuchsia-500/12 text-fuchsia-500",
  // payment
  paid: "bg-brand-500/12 text-brand-600 dark:text-brand-400",
  failed: "bg-rose-500/12 text-rose-500",
  "partially-refunded": "bg-orange-500/12 text-orange-500",
  // customer / generic
  active: "bg-brand-500/12 text-brand-600 dark:text-brand-400",
  suspended: "bg-rose-500/12 text-rose-500",
  hidden: "bg-surface-2 text-muted",
};
export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", statusStyles[status] ?? "bg-surface-2 text-muted")}>
      <span className="size-1.5 rounded-full bg-current" /> {status.replace(/-/g, " ")}
    </span>
  );
}

/* ── Buttons ──────────────────────────────────────────────── */
export function Btn({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: "primary" | "outline" | "ghost" | "danger"; size?: "sm" | "md" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = {
    primary: "bg-brand-500 text-brand-950 hover:bg-brand-400",
    outline: "border border-border hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400",
    ghost: "hover:bg-surface-2 text-muted hover:text-foreground",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  }[variant];
  const s = size === "sm" ? "h-8 px-3 text-xs gap-1.5" : "h-10 px-4 text-sm gap-2";
  return <button className={cn("inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-60", v, s, className)} {...props} />;
}

/* ── Form fields ──────────────────────────────────────────── */
export function Field({ label, hint, className, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <input {...props} className="h-10 rounded-lg border border-border bg-background px-3 outline-none transition-colors focus:border-brand-500" />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
export function TextArea({ label, hint, className, ...props }: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <textarea {...props} className="rounded-lg border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-brand-500" />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
export function Select({ label, hint, className, children, ...props }: { label: string; hint?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <div className="relative">
        <select {...props} className="h-10 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-9 outline-none transition-colors focus:border-brand-500">
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
export function Toggle({ label, checked, onChange }: { label?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-surface-2")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </span>
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
}

/* ── Search input ─────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Search…"} className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-brand-500 sm:w-64" />
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-surface-2 text-muted"><Icon size={24} /></div>
      <p className="font-semibold">{title}</p>
      {desc && <p className="max-w-sm text-sm text-muted">{desc}</p>}
      {action}
    </div>
  );
}

/* ── Confirm dialog ───────────────────────────────────────── */
export function ConfirmDialog({ open, title, desc, confirmLabel = "Delete", onConfirm, onClose }: { open: boolean; title: string; desc?: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-500/12 text-rose-500"><AlertTriangle size={22} /></div>
            <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
            {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
            <div className="mt-5 flex gap-3">
              <Btn variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn>
              <Btn variant="danger" className="flex-1" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Drawer ───────────────────────────────────────────────── */
export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="relative z-10 flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-border p-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Bar chart ────────────────────────────────────────────── */
export function BarChart({ data, labels, height = 200 }: { data: number[]; labels: string[]; height?: number }) {
  const max = Math.max(...data, 1);
  const plot = height - 26; // leave room for the labels row
  const rows = 4; // horizontal gridlines
  return (
    <div>
      <div className="relative" style={{ height: plot }}>
        {/* gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-border/60" />
          ))}
        </div>
        {/* bars */}
        <div className="absolute inset-0 flex items-end gap-3">
          {data.map((d, i) => (
            <div key={i} className="group flex flex-1 items-end justify-center">
              <div className="relative flex w-full max-w-[2.75rem] justify-center">
                <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[0.6rem] font-semibold text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {d.toLocaleString()}
                </div>
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-300",
                    d > 0 ? "bg-gradient-to-t from-brand-600 to-brand-400" : "bg-surface-2",
                  )}
                  style={{ height: Math.max(6, (d / max) * plot) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* labels */}
      <div className="mt-2 flex gap-3">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center text-[0.7rem] font-medium text-muted">{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Pagination hook ──────────────────────────────────────── */
export function usePaginated<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  const slice = useMemo(() => items.slice((page - 1) * perPage, page * perPage), [items, page, perPage]);
  return { slice, page, pages, setPage };
}

export function Pagination({ page, pages, setPage, total }: { page: number; pages: number; setPage: (p: number) => void; total: number }) {
  if (pages <= 1) return <p className="text-xs text-muted">{total} total</p>;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-muted">{total} total</p>
      <div className="flex items-center gap-1">
        <Btn size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Btn>
        <span className="px-2 text-sm tabular-nums">{page} / {pages}</span>
        <Btn size="sm" variant="outline" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Btn>
      </div>
    </div>
  );
}

/* ── API helper ───────────────────────────────────────────── */
export async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

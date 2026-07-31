"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminCard({
  title,
  desc,
  children,
  className,
  action,
}: {
  title?: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
            {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function HelpNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/8 p-3.5 text-sm text-foreground/80">
      <Info size={17} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
      <div>{children}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  className,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="h-10 rounded-lg border border-border bg-background px-3 outline-none transition-colors focus:border-brand-500"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <textarea
        {...props}
        className="rounded-lg border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-brand-500"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  hint,
  className,
  children,
  ...props
}: { label: string; hint?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <select
        {...props}
        className="h-10 rounded-lg border border-border bg-background px-3 outline-none transition-colors focus:border-brand-500"
      >
        {children}
      </select>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm"
    >
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-surface-2")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/** Async fetch helper for the admin API. */
export async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

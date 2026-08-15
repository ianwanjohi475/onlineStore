"use client";

import { Database, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Health {
  backend: "database" | "file";
  connected: boolean;
}

/** At-a-glance indicator in the admin topbar of which storage backend is live. */
export function DbBadge() {
  const [h, setH] = useState<Health | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/admin/health").then((r) => r.json()).then(setH).catch(() => {});
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, []);

  const db = h?.backend === "database" && h.connected;
  const file = h?.backend === "file";
  const dbError = h?.backend === "database" && !h.connected;

  const label = !h ? "Checking…" : db ? "Database" : file ? "File store" : "DB error";
  const dot = !h ? "bg-muted" : db ? "bg-brand-500" : file ? "bg-amber-500" : "bg-rose-500";
  const tone = dbError ? "text-rose-500" : file ? "text-amber-600" : "text-muted";
  const Icon = file ? HardDrive : Database;
  const title = db
    ? "Connected to your database"
    : file
      ? "Using the local file store — set DATABASE_URL to switch to your database"
      : dbError
        ? "Database configured but unreachable"
        : "Checking backend…";

  return (
    <a
      href="/admin/status"
      title={title}
      className={cn(
        "hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-brand-500/50 sm:inline-flex",
        tone,
      )}
    >
      <span className={cn("size-2 rounded-full", dot)} />
      <Icon size={13} /> {label}
    </a>
  );
}

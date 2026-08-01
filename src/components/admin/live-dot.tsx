"use client";

import { useEffect, useState } from "react";
import { useLive } from "@/hooks/use-live";
import { cn } from "@/lib/utils";

/** Small connection indicator for the admin topbar; briefly flashes on each live update. */
export function LiveDot() {
  const { status, pulse } = useLive();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (pulse === 0) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(t);
  }, [pulse]);

  const dot = status === "live" ? "bg-brand-500" : status === "connecting" ? "bg-amber-500" : "bg-rose-500";
  const label = status === "live" ? (flash ? "Updated" : "Live") : status === "connecting" ? "Connecting" : "Offline";

  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:inline-flex",
        flash ? "border-brand-500/50 text-brand-600 dark:text-brand-400" : "border-border text-muted",
      )}
      title="Real-time updates are on"
    >
      <span className="relative grid size-2 place-items-center">
        <span className={cn("size-2 rounded-full", dot)} />
        {(status === "live" && flash) && <span className="absolute size-2 animate-ping rounded-full bg-brand-500" />}
      </span>
      {label}
    </span>
  );
}

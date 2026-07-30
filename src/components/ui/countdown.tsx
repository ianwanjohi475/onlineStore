"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const clamp = Math.max(0, ms);
  return {
    days: Math.floor(clamp / 86_400_000),
    hours: Math.floor((clamp / 3_600_000) % 24),
    minutes: Math.floor((clamp / 60_000) % 60),
    seconds: Math.floor((clamp / 1000) % 60),
  };
}

/** Counts down to `target` (ms epoch). SSR-safe: renders zeros until mounted. */
export function Countdown({
  target,
  className,
  compact = false,
}: {
  target: number;
  className?: string;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const p = parts(remaining ?? 0);
  const units: [string, number][] = [
    ["Days", p.days],
    ["Hrs", p.hours],
    ["Min", p.minutes],
    ["Sec", p.seconds],
  ];

  return (
    <div className={cn("flex items-center gap-2", className)} suppressHydrationWarning>
      {units.map(([label, val], i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex flex-col items-center rounded-xl bg-foreground/90 px-2.5 py-1.5 text-background",
              compact ? "min-w-[2.75rem]" : "min-w-[3.25rem]",
            )}
          >
            <span
              className={cn(
                "font-display font-bold tabular-nums leading-none",
                compact ? "text-lg" : "text-2xl",
              )}
            >
              {String(val).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-wider opacity-70">
              {label}
            </span>
          </div>
          {i < units.length - 1 && <span className="font-bold text-brand-500">:</span>}
        </div>
      ))}
    </div>
  );
}

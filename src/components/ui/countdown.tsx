"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Next midnight in Nairobi (UTC+3) — flash deals reset daily. */
function nextNairobiMidnight(now = Date.now()) {
  const EAT = 3 * 3_600_000;
  const local = now + EAT;
  return local - (local % 86_400_000) + 86_400_000 - EAT;
}

/**
 * Compact deal timer: "07h : 59m : 42s". Counts to `target`, or to the next
 * Nairobi midnight when no target is given. Renders dashes until mounted so
 * server and browser HTML match.
 */
export function Countdown({
  target,
  className,
  tone = "dark",
}: {
  target?: number;
  className?: string;
  /** kept for backwards compatibility */
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, (target ?? nextNairobiMidnight()) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const s = remaining === null ? null : Math.floor(remaining / 1000);
  const units: [string, number | null][] = [
    ["h", s === null ? null : Math.floor(s / 3600)],
    ["m", s === null ? null : Math.floor((s % 3600) / 60)],
    ["s", s === null ? null : s % 60],
  ];

  return (
    <div className={cn("inline-flex items-center gap-1", className)} aria-label="Time left" role="timer">
      {units.map(([label, v], i) => (
        <span key={label} className="inline-flex items-center gap-1">
          <span
            className={cn(
              "inline-flex min-w-[2.35rem] items-baseline justify-center rounded-md px-1.5 py-1 font-display text-sm font-bold tabular-nums leading-none",
              tone === "dark" ? "bg-[#1b1d22] text-white" : "bg-white text-[#1b1d22]",
            )}
          >
            {v === null ? "--" : String(v).padStart(2, "0")}
            <span className="ml-0.5 text-[0.6rem] font-semibold opacity-70">{label}</span>
          </span>
          {i < units.length - 1 && <span className="text-xs font-bold text-muted">:</span>}
        </span>
      ))}
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Text wordmark (original mark, not the Oraimo logo artwork). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="Oraimo home">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-brand-950 shadow-[0_0_20px_-4px_var(--color-brand-500)] transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path d="M12 3v6M12 3a5 5 0 0 1 5 5c0 2.5-2 4-5 4s-5-1.5-5-4a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 14c0 4 2.7 7 6 7s6-3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        oraimo<span className="text-brand-500">.</span>
      </span>
    </Link>
  );
}

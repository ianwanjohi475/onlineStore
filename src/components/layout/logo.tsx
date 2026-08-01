import Link from "next/link";
import { cn } from "@/lib/utils";

/** Text wordmark for SIR VERT ENTERPRISE. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="SIR VERT ENTERPRISE home">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-500 font-display text-sm font-black text-brand-950 shadow-[0_0_20px_-4px_var(--color-brand-500)] transition-transform group-hover:scale-105">
        SV
      </span>
      <span className="font-display text-lg font-bold leading-none tracking-tight">
        SIR VERT<span className="text-brand-500">.</span>
      </span>
    </Link>
  );
}

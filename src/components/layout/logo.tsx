import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand logo for SIR VERT ENTERPRISE: an open "C" ring with a lime spark dot,
 * paired with the two-tier wordmark. No background box — sits cleanly on any
 * header. Pure inline SVG, theme-aware, razor-sharp at any size.
 */
export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  /** true when placed on the navy header/footer */
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="SIR VERT ENTERPRISE — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <LogoMark
        className={cn(
          "size-9 shrink-0 transition-transform duration-300 ease-out group-hover:scale-105",
          onDark ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-400",
        )}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-[1.05rem] font-extrabold tracking-tight", onDark ? "text-white" : "text-navy dark:text-white")}>
            SIR VERT
          </span>
          <span className={cn("mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.3em]", onDark ? "text-emerald-300" : "text-emerald-700 dark:text-emerald-300")}>
            Enterprise
          </span>
        </span>
      )}
    </Link>
  );
}

/** The standalone mark — reuse for favicons, footers, loaders, etc. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="SIR VERT ENTERPRISE">
      {/* open C ring */}
      <circle
        cx="24"
        cy="24"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.6"
        strokeLinecap="round"
        strokeDasharray="70 94.25"
        transform="rotate(-4 24 24)"
      />
      {/* lime spark dot */}
      <circle cx="25.5" cy="24" r="4.6" className="fill-lime-400" />
    </svg>
  );
}

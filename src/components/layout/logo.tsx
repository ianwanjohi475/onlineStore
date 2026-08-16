import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand logo for SIR VERT ENTERPRISE: a premium dark badge with an emerald mark
 * (a bold "V" for Vert rising into a signal spark — electronics + networking),
 * paired with a two-tier wordmark. Pure inline SVG, razor-sharp at any size,
 * theme-aware.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="SIR VERT ENTERPRISE — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <LogoMark className="size-9 shrink-0 transition-transform duration-300 ease-out group-hover:scale-105" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-extrabold tracking-tight text-foreground">
            SIR VERT
          </span>
          <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">
            Enterprise
          </span>
        </span>
      )}
    </Link>
  );
}

/** The standalone badge mark — reuse for favicons, footers, loaders, etc. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} role="img" aria-label="SIR VERT ENTERPRISE">
      <defs>
        <linearGradient id="sv-badge" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B2430" />
          <stop offset="1" stopColor="#0B1220" />
        </linearGradient>
        <linearGradient id="sv-v" x1="10" y1="12" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22E188" />
          <stop offset="1" stopColor="#00C060" />
        </linearGradient>
      </defs>

      {/* dark rounded badge */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#sv-badge)" />
      <rect x="1.5" y="1.5" width="37" height="37" rx="10.5" stroke="#FFFFFF" strokeOpacity="0.10" />
      {/* subtle emerald floor glow */}
      <ellipse cx="20" cy="33" rx="12" ry="3" fill="#00E676" opacity="0.18" />

      {/* the "V" mark in emerald — right arm rises into a spark */}
      <path
        d="M10.5 12.5 L19.2 28.5 L27.4 11.8"
        stroke="url(#sv-v)"
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* signal spark at the tip of the rising arm */}
      <path
        d="M29 5.6 L30.4 8.7 L33.5 10.1 L30.4 11.5 L29 14.6 L27.6 11.5 L24.5 10.1 L27.6 8.7 Z"
        fill="#22E188"
      />
    </svg>
  );
}

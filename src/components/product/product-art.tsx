import type { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Generated, category-specific product artwork.
 * Placeholder visuals (no proprietary photography) — a tinted gradient stage
 * plus a clean SVG silhouette per category, so cards look designed, not empty.
 */

function Glyph({ category, accent }: { category: CategorySlug; accent: string }) {
  const stroke = { fill: "none", stroke: accent, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (category) {
    case "earbuds":
      return (
        <g {...stroke}>
          <path d="M70 60c-14 0-24 12-24 30 0 14 8 22 8 40 0 12 8 20 18 20s14-8 14-22V70c0-6-4-10-16-10Z" fill={`${accent}22`} />
          <path d="M130 60c14 0 24 12 24 30 0 14-8 22-8 40 0 12-8 20-18 20s-14-8-14-22V70c0-6 4-10 16-10Z" fill={`${accent}22`} />
        </g>
      );
    case "smartwatches":
      return (
        <g {...stroke}>
          <rect x="70" y="70" width="60" height="60" rx="18" fill={`${accent}22`} />
          <path d="M85 70l6-24h18l6 24M85 130l6 24h18l6-24" />
          <circle cx="100" cy="100" r="14" />
        </g>
      );
    case "power-banks":
      return (
        <g {...stroke}>
          <rect x="66" y="52" width="68" height="96" rx="16" fill={`${accent}22`} />
          <path d="M104 78l-16 26h14l-4 22 20-30h-14z" fill={accent} stroke="none" />
        </g>
      );
    case "chargers":
      return (
        <g {...stroke}>
          <rect x="72" y="60" width="56" height="56" rx="16" fill={`${accent}22`} />
          <path d="M88 116v18M112 116v18" />
          <path d="M100 60V40" />
        </g>
      );
    case "cables":
      return (
        <g {...stroke}>
          <path d="M60 60v22a20 20 0 0 0 40 0 20 20 0 0 1 40 0v58" />
          <rect x="52" y="46" width="16" height="18" rx="4" fill={`${accent}22`} />
          <rect x="132" y="136" width="16" height="20" rx="4" fill={`${accent}22`} />
        </g>
      );
    case "speakers":
      return (
        <g {...stroke}>
          <rect x="66" y="52" width="68" height="96" rx="20" fill={`${accent}22`} />
          <circle cx="100" cy="112" r="20" />
          <circle cx="100" cy="76" r="7" />
        </g>
      );
    default:
      return (
        <g {...stroke}>
          <path d="M100 52l14 30 32 4-24 22 7 32-29-16-29 16 7-32-24-22 32-4z" fill={`${accent}22`} />
        </g>
      );
  }
}

export function ProductArt({
  category,
  accent,
  className,
  glow = true,
}: {
  category: CategorySlug;
  accent: string;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn("relative grid place-items-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 120% at 30% 0%, ${accent}26 0%, transparent 55%), radial-gradient(90% 90% at 80% 100%, ${accent}1f 0%, transparent 60%)`,
      }}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute size-2/3 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.22 }}
        />
      )}
      <svg viewBox="0 0 200 200" className="relative z-10 size-3/5 drop-shadow-lg" role="img" aria-hidden>
        <Glyph category={category} accent={accent} />
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent dark:from-black/30" />
    </div>
  );
}

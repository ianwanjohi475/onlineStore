import { useId } from "react";
import type { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Studio-style generated product renders (shaded SVG with gradients, highlights and a
 * contact shadow) used as a fallback when no real photograph is supplied.
 * Drop a real photo at `public/products/{slug}.jpg` and <ProductImage> will use it instead.
 */

function Render({ category, accent, uid }: { category: CategorySlug; accent: string; uid: string }) {
  const g = (s: string) => `${uid}-${s}`;
  const common = (
    <defs>
      <linearGradient id={g("body")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2f3a" />
        <stop offset="0.5" stopColor="#171a22" />
        <stop offset="1" stopColor="#0c0e14" />
      </linearGradient>
      <linearGradient id={g("accent")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={accent} />
        <stop offset="1" stopColor={accent} stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={g("metal")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3a3f4b" />
        <stop offset="0.5" stopColor="#5b6272" />
        <stop offset="1" stopColor="#2b2f3a" />
      </linearGradient>
      <radialGradient id={g("sheen")} cx="0.35" cy="0.25" r="0.8">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const shadow = <ellipse cx="130" cy="212" rx="78" ry="12" fill="#000" opacity="0.28" />;

  switch (category) {
    case "earbuds":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* charging case */}
          <rect x="74" y="70" width="112" height="118" rx="34" fill={`url(#${g("body")})`} />
          <rect x="74" y="70" width="112" height="118" rx="34" fill={`url(#${g("sheen")})`} />
          <path d="M74 108a34 34 0 0 1 34-34h44a34 34 0 0 1 34 34v4H74z" fill="#000" opacity="0.25" />
          <rect x="118" y="70" width="24" height="6" rx="3" fill="#000" opacity="0.3" />
          <circle cx="130" cy="150" r="5" fill={accent} />
          <circle cx="130" cy="150" r="9" fill="none" stroke={accent} strokeOpacity="0.4" />
          {/* two buds peeking */}
          <g transform="translate(96 40)">
            <ellipse cx="0" cy="0" rx="13" ry="16" fill={`url(#${g("body")})`} />
            <rect x="-4" y="10" width="8" height="34" rx="4" fill={`url(#${g("body")})`} />
            <ellipse cx="-3" cy="-4" rx="4" ry="5" fill="#fff" opacity="0.25" />
          </g>
          <g transform="translate(164 40)">
            <ellipse cx="0" cy="0" rx="13" ry="16" fill={`url(#${g("body")})`} />
            <rect x="-4" y="10" width="8" height="34" rx="4" fill={`url(#${g("body")})`} />
            <ellipse cx="-3" cy="-4" rx="4" ry="5" fill="#fff" opacity="0.25" />
          </g>
        </svg>
      );
    case "smartwatches":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* strap */}
          <path d="M108 40c-8 20-8 30-8 40h60c0-10 0-20-8-40z" fill={`url(#${g("metal")})`} />
          <path d="M100 160c0 10 0 20 8 40h44c8-20 8-30 8-40z" fill={`url(#${g("metal")})`} />
          {/* body */}
          <rect x="84" y="78" width="92" height="84" rx="26" fill={`url(#${g("metal")})`} />
          <rect x="90" y="84" width="80" height="72" rx="20" fill="#0a0d14" />
          <rect x="90" y="84" width="80" height="72" rx="20" fill={`url(#${g("sheen")})`} />
          {/* face UI */}
          <circle cx="130" cy="120" r="26" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="4" />
          <path d="M130 120 L130 102 M130 120 L145 128" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="130" cy="120" r="3" fill={accent} />
          <rect x="176" y="104" width="6" height="20" rx="3" fill={`url(#${g("metal")})`} />
        </svg>
      );
    case "power-banks":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          <rect x="86" y="52" width="88" height="140" rx="20" fill={`url(#${g("body")})`} />
          <rect x="86" y="52" width="88" height="140" rx="20" fill={`url(#${g("sheen")})`} />
          {/* display */}
          <rect x="104" y="74" width="52" height="34" rx="8" fill="#05070c" />
          <text x="130" y="99" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="700" fill={accent}>85</text>
          {/* charge bolt */}
          <path d="M134 128l-14 22h12l-4 20 18-26h-12z" fill={accent} />
          {/* ports */}
          <rect x="104" y="176" width="20" height="6" rx="3" fill="#05070c" />
          <rect x="136" y="176" width="20" height="6" rx="3" fill="#05070c" />
        </svg>
      );
    case "speakers":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          <rect x="82" y="60" width="96" height="132" rx="30" fill={`url(#${g("body")})`} />
          {/* fabric grille */}
          <clipPath id={g("clip")}><rect x="92" y="92" width="76" height="86" rx="20" /></clipPath>
          <rect x="92" y="92" width="76" height="86" rx="20" fill="#0a0d14" />
          <g clipPath={`url(#${g("clip")})`} fill="#ffffff" opacity="0.06">
            {Array.from({ length: 9 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={98 + c * 9} cy={98 + r * 9} r="2.4" />
              )),
            )}
          </g>
          {/* top controls */}
          <circle cx="118" cy="76" r="5" fill={accent} />
          <rect x="134" y="72" width="26" height="8" rx="4" fill={`url(#${g("metal")})`} />
        </svg>
      );
    case "chargers":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          <rect x="96" y="70" width="68" height="76" rx="18" fill={`url(#${g("body")})`} />
          <rect x="96" y="70" width="68" height="76" rx="18" fill={`url(#${g("sheen")})`} />
          {/* prongs */}
          <rect x="112" y="50" width="8" height="22" rx="3" fill={`url(#${g("metal")})`} />
          <rect x="140" y="50" width="8" height="22" rx="3" fill={`url(#${g("metal")})`} />
          {/* USB-C ports with glow */}
          <rect x="108" y="150" width="20" height="8" rx="4" fill="#05070c" />
          <rect x="132" y="150" width="20" height="8" rx="4" fill="#05070c" />
          <circle cx="130" cy="108" r="7" fill={accent} opacity="0.9" />
        </svg>
      );
    case "cables":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* braided cable */}
          <path d="M78 66c0 40 40 30 40 62s-38 20-38 44" fill="none" stroke={`url(#${g("metal")})`} strokeWidth="12" strokeLinecap="round" />
          <path d="M78 66c0 40 40 30 40 62s-38 20-38 44" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="4" strokeDasharray="3 5" />
          {/* connectors */}
          <rect x="68" y="48" width="20" height="26" rx="5" fill={`url(#${g("metal")})`} />
          <rect x="72" y="40" width="12" height="12" rx="3" fill={accent} />
          <rect x="70" y="176" width="20" height="26" rx="5" fill={`url(#${g("metal")})`} />
          <rect x="152" y="120" width="26" height="18" rx="5" fill={`url(#${g("metal")})`} transform="rotate(20 165 129)" />
        </svg>
      );
    case "cameras":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* dome camera body */}
          <rect x="86" y="150" width="88" height="26" rx="10" fill={`url(#${g("metal")})`} />
          <path d="M74 150a56 56 0 0 1 112 0z" fill={`url(#${g("body")})`} />
          <path d="M74 150a56 56 0 0 1 112 0z" fill={`url(#${g("sheen")})`} />
          {/* lens */}
          <circle cx="130" cy="126" r="26" fill="#05070c" />
          <circle cx="130" cy="126" r="18" fill="none" stroke={`url(#${g("metal")})`} strokeWidth="4" />
          <circle cx="130" cy="126" r="9" fill={accent} opacity="0.85" />
          <circle cx="124" cy="120" r="3" fill="#fff" opacity="0.5" />
          {/* status LED */}
          <circle cx="104" cy="162" r="3" fill={accent} />
        </svg>
      );
    case "home-appliances":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* upright appliance body */}
          <rect x="90" y="52" width="80" height="140" rx="22" fill={`url(#${g("body")})`} />
          <rect x="90" y="52" width="80" height="140" rx="22" fill={`url(#${g("sheen")})`} />
          {/* control panel */}
          <rect x="104" y="70" width="52" height="30" rx="8" fill="#05070c" />
          <circle cx="118" cy="85" r="6" fill={accent} />
          <rect x="132" y="80" width="18" height="4" rx="2" fill={accent} opacity="0.6" />
          <rect x="132" y="88" width="12" height="4" rx="2" fill="#fff" opacity="0.2" />
          {/* vents */}
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x="106" y={120 + i * 14} width="48" height="6" rx="3" fill="#000" opacity="0.25" />
          ))}
        </svg>
      );
    case "computing":
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          {/* keyboard slab */}
          <rect x="66" y="120" width="128" height="60" rx="12" fill={`url(#${g("body")})`} />
          <rect x="66" y="120" width="128" height="60" rx="12" fill={`url(#${g("sheen")})`} />
          <g fill="#05070c">
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <rect key={`${r}-${c}`} x={78 + c * 14} y={130 + r * 14} width="10" height="10" rx="2" />
              )),
            )}
          </g>
          <rect x="104" y="172" width="52" height="4" rx="2" fill={accent} opacity="0.5" />
          {/* mouse */}
          <ellipse cx="208" cy="150" rx="0" ry="0" fill="none" />
          <path d="M74 92c0-14 10-24 24-24s24 10 24 24v6H74z" fill={`url(#${g("metal")})`} />
          <rect x="96" y="70" width="4" height="16" rx="2" fill={accent} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 260 240" className="size-full">
          {common}
          {shadow}
          <rect x="88" y="66" width="84" height="112" rx="22" fill={`url(#${g("body")})`} />
          <rect x="88" y="66" width="84" height="112" rx="22" fill={`url(#${g("sheen")})`} />
          <path d="M130 96l10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3z" fill={accent} />
        </svg>
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
  const uid = useId().replace(/:/g, "");
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-gradient-to-b from-white to-neutral-100 dark:from-[#1a1d25] dark:to-[#0c0e14]",
        className,
      )}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute bottom-2 h-1/3 w-3/4 rounded-full blur-2xl"
          style={{ background: accent, opacity: 0.18 }}
        />
      )}
      <div className="relative z-10 size-[86%] animate-float [animation-duration:7s]">
        <Render category={category} accent={accent} uid={uid} />
      </div>
    </div>
  );
}

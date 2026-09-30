import {
  IconBatteryCharging2, IconDeviceAirpodsCase, IconDeviceCctv, IconDeviceLaptop, IconDeviceMobile, IconDeviceSpeaker,
  IconDeviceWatch, IconFridge, IconPlugConnected, IconShoppingBag, IconSparkles, IconUsb,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Category icons from Tabler Icons (MIT) — thin, device-specific line icons
 * (earbuds case, smartwatch, CCTV camera…), the style big electronics stores use.
 */
const ICONS: Record<string, { icon: TablerIcon; tint: string }> = {
  earbuds: { icon: IconDeviceAirpodsCase, tint: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  smartwatches: { icon: IconDeviceWatch, tint: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  "power-banks": { icon: IconBatteryCharging2, tint: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  chargers: { icon: IconPlugConnected, tint: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  cables: { icon: IconUsb, tint: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200" },
  speakers: { icon: IconDeviceSpeaker, tint: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  "home-appliances": { icon: IconFridge, tint: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  computing: { icon: IconDeviceLaptop, tint: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  cameras: { icon: IconDeviceCctv, tint: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  accessories: { icon: IconDeviceMobile, tint: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
  "new-arrivals": { icon: IconSparkles, tint: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300" },
};
const FALLBACK = { icon: IconShoppingBag, tint: "bg-surface-2 text-muted" };

/** Just the line icon (inherits the current text colour). */
export function CategoryIcon({ slug, className, size = 20 }: { slug: string; className?: string; size?: number }) {
  const { icon: Icon } = ICONS[slug] ?? FALLBACK;
  return <Icon size={size} stroke={1.5} aria-hidden className={cn("shrink-0", className)} />;
}

/** The icon inside a soft tinted circle/tile. */
export function CategoryBadge({ slug, className, size = 22 }: { slug: string; className?: string; size?: number }) {
  const { icon: Icon, tint } = ICONS[slug] ?? FALLBACK;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full", tint, className)}>
      <Icon size={size} stroke={1.5} aria-hidden />
    </span>
  );
}

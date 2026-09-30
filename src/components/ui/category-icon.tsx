import {
  BatteryCharging, Cable, Cctv, Headphones, Laptop, PlugZap, Refrigerator, ShoppingBag, Smartphone, Sparkles, Speaker, Watch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Category → Lucide icon (consistent line icons, like big marketplaces use). */
const ICONS: Record<string, { icon: LucideIcon; tint: string }> = {
  earbuds: { icon: Headphones, tint: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
  smartwatches: { icon: Watch, tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" },
  "power-banks": { icon: BatteryCharging, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
  chargers: { icon: PlugZap, tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
  cables: { icon: Cable, tint: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200" },
  speakers: { icon: Speaker, tint: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" },
  "home-appliances": { icon: Refrigerator, tint: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
  computing: { icon: Laptop, tint: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" },
  cameras: { icon: Cctv, tint: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" },
  accessories: { icon: Smartphone, tint: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300" },
  "new-arrivals": { icon: Sparkles, tint: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-300" },
};
const FALLBACK = { icon: ShoppingBag, tint: "bg-surface-2 text-muted" };

/** Just the line icon, coloured for its category. */
export function CategoryIcon({ slug, className, size = 20 }: { slug: string; className?: string; size?: number }) {
  const { icon: Icon, tint } = ICONS[slug] ?? FALLBACK;
  return <Icon size={size} strokeWidth={1.9} aria-hidden className={cn("shrink-0", tint.split(" ").filter((c) => c.includes("text-")).join(" "), className)} />;
}

/** The icon inside a soft tinted circle/tile. */
export function CategoryBadge({ slug, className, size = 22 }: { slug: string; className?: string; size?: number }) {
  const { icon: Icon, tint } = ICONS[slug] ?? FALLBACK;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full", tint, className)}>
      <Icon size={size} strokeWidth={1.9} aria-hidden />
    </span>
  );
}

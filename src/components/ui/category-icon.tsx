import { cn } from "@/lib/utils";

const KNOWN = new Set([
  "earbuds", "smartwatches", "power-banks", "chargers", "cables", "speakers",
  "home-appliances", "computing", "cameras", "accessories", "new-arrivals",
]);

/** Full-colour category icon (Microsoft Fluent Emoji, MIT). Categories added
 *  later from the admin fall back to a shopping-bags icon. */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const file = KNOWN.has(slug) ? slug : "default";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/icons/cat/${file}.svg`} alt="" aria-hidden width={32} height={32} loading="lazy" decoding="async" className={cn("size-6 shrink-0 object-contain", className)} />
  );
}

"use client";

import { useRecentlyViewed } from "@/context/recently-viewed";
import { productMap } from "@/lib/data/products";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "./product-card";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const recent = useRecentlyViewed();
  if (!recent.hydrated) return null;

  const items = recent.slugs
    .filter((s) => s !== exclude)
    .map((s) => productMap[s])
    .filter(Boolean)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Pick up where you left off" title="Recently" accent="viewed" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

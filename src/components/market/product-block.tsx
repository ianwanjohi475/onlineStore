import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CompactProductCard } from "@/components/product/compact-product-card";
import type { Product } from "@/lib/types";

/** Titled marketplace product block with a dense grid (Jumia/Kilimall style). */
export function ProductBlock({
  title,
  subtitle,
  href = "/shop",
  products,
  accent = "var(--color-brand-500)",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  products: Product[];
  accent?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3.5" style={{ borderLeft: `4px solid ${accent}` }}>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            See all <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <CompactProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

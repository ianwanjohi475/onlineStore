import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/product/product-grid";
import { bestSellers, newArrivals } from "@/lib/data/products";

export function BestSellers() {
  return (
    <section className="container-x py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Loved by thousands" title="Best" accent="sellers" />
        <Reveal>
          <Link href="/shop?sort=popular" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Shop all →
          </Link>
        </Reveal>
      </div>
      <div className="mt-10">
        <ProductGrid products={bestSellers.slice(0, 4)} />
      </div>

      <div className="mt-20 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Fresh off the line" title="New" accent="arrivals" />
        <Reveal>
          <Link href="/categories/new-arrivals" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            See what&apos;s new →
          </Link>
        </Reveal>
      </div>
      <div className="mt-10">
        <ProductGrid products={newArrivals.slice(0, 4)} />
      </div>
    </section>
  );
}

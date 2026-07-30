import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "./product-card";

export function RelatedProducts({ products, title = "You might also", accent = "like" }: { products: Product[]; title?: string; accent?: string }) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Recommended" title={title} accent={accent} />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

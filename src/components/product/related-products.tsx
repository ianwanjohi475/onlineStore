import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "./product-card";

export function RelatedProducts({
  products,
  eyebrow = "Recommended",
  title = "You might also",
  accent = "like",
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  accent?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-10 sm:py-12">
      <SectionHeading eyebrow={eyebrow} title={title} accent={accent} />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

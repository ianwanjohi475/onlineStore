import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} index={i} />
      ))}
    </div>
  );
}

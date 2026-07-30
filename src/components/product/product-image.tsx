import Image from "next/image";
import type { Product } from "@/lib/types";
import { productImages } from "@/lib/data/product-images";
import { cn } from "@/lib/utils";
import { ProductArt } from "./product-art";

/**
 * Renders a real product photograph when one is registered in `productImages`,
 * otherwise falls back to the generated studio render. Drop-in upgrade path:
 * add a file to /public/products and an entry to product-images.ts.
 */
export function ProductImage({
  product,
  className,
  glow = true,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: {
  product: Product;
  className?: string;
  glow?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const src = productImages[product.slug];
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-b from-white to-neutral-100 dark:from-[#1a1d25] dark:to-[#0c0e14]", className)}>
        <Image
          src={src}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }
  return <ProductArt category={product.category} accent={product.accent} className={className} glow={glow} />;
}

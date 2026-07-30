"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { productImages } from "@/lib/data/product-images";
import { cn } from "@/lib/utils";
import { ProductArt } from "./product-art";

const studioBg =
  "relative overflow-hidden bg-gradient-to-b from-white to-neutral-100 dark:from-[#1a1d25] dark:to-[#0c0e14]";

/**
 * Prefers a real photograph (local /products/* via next/image, or a remote URL via <img>),
 * and gracefully falls back to the generated studio render if the image is missing or fails.
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
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ProductArt category={product.category} accent={product.accent} className={className} glow={glow} />;
  }

  const isLocal = src.startsWith("/");

  return (
    <div className={cn(studioBg, className)}>
      {isLocal ? (
        <Image
          src={src}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        // Remote keyword photos: plain img avoids remote-host/redirect config and
        // lets us fall back cleanly on any load error.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductArt } from "./product-art";

const studioBg =
  "relative overflow-hidden bg-gradient-to-b from-white to-neutral-100 dark:from-[#1a1d25] dark:to-[#0c0e14]";

/**
 * Prefers a real photograph (local /products/* via next/image, or a remote URL via <img>),
 * fades it in on load, and gracefully falls back to the studio render on any error.
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
  const src = product.image;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return <ProductArt category={product.category} accent={product.accent} className={className} glow={glow} />;
  }

  const fade = cn("transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0");

  return (
    <div className={cn(studioBg, className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden />}
      {src.startsWith("/") ? (
        <Image
          src={src}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("object-cover", fade)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 size-full object-cover", fade)}
        />
      )}
    </div>
  );
}

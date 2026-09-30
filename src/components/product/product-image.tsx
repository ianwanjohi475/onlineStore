"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const frame = "relative overflow-hidden bg-white dark:bg-[#15181d]";

/**
 * The product's real photo (local /products/* via next/image, or an uploaded
 * URL). Products without a photo yet get a plain, empty space — the owner adds
 * the picture from Admin → Products and it appears here automatically.
 */
export function ProductImage({
  product,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: {
  product: Product;
  className?: string;
  /** kept for backwards compatibility; no longer used */
  glow?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const src = product.image;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return <div className={cn(frame, "bg-surface-2 dark:bg-surface-2", className)} role="img" aria-label={`${product.name} — photo coming soon`} />;
  }

  const fade = cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0");

  return (
    <div className={cn(frame, className)}>
      {!loaded && <div className="absolute inset-0 bg-surface-2" aria-hidden />}
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
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 size-full object-cover", fade)}
        />
      )}
    </div>
  );
}

"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Rating } from "@/components/ui/rating";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import type { Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

/** Dense marketplace-style product card (Jumia/Kilimall feel). */
export function CompactProductCard({ product, showSold = false }: { product: Product; showSold?: boolean }) {
  const wishlist = useWishlist();
  const toast = useToast();
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const wished = wishlist.has(product.slug);
  const sold = product.soldPercent ?? 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-brand-500/50 hover:shadow-card">
      <div className="relative">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <ProductImage product={product} glow={false} sizes="(max-width:768px) 45vw, 200px" className="aspect-square" />
        </Link>
        {off > 0 && (
          <span className="absolute left-0 top-2 rounded-r-md bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
            -{off}%
          </span>
        )}
        <button
          onClick={() => { wishlist.toggle(product.slug); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          aria-label="Wishlist"
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-surface/90 text-muted shadow-sm transition-colors hover:text-rose-500"
        >
          <Heart size={15} className={cn(wished && "fill-rose-500 text-rose-500")} />
        </button>
        <AddToCartButton product={product} variant="icon" className="absolute bottom-2 right-2 size-9 shadow-lg" />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm leading-snug transition-colors hover:text-brand-600 dark:hover:text-brand-400">
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-bold">{formatPrice(product.price)}</span>
          {product.compareAt && <span className="text-xs text-muted line-through">{formatPrice(product.compareAt)}</span>}
        </div>
        <div className="mt-1">
          <Rating value={product.rating} count={product.reviewCount} size={12} />
        </div>

        {showSold && (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-brand-500" style={{ width: `${sold}%` }} />
            </div>
            <p className="mt-1 text-[0.65rem] font-semibold text-rose-500">{sold}% sold</p>
          </div>
        )}
      </div>
    </div>
  );
}

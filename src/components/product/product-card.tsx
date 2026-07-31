"use client";

import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import type { Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";
import { QuickView } from "./quick-view";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const wishlist = useWishlist();
  const toast = useToast();
  const [quickOpen, setQuickOpen] = useState(false);

  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const wished = wishlist.has(product.slug);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-card"
      >
        {/* media */}
        <div className="relative">
          <Link href={`/product/${product.slug}`} aria-label={product.name}>
            <ProductImage product={product} className="aspect-square transition-transform duration-500 group-hover:scale-[1.04]" />
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {off > 0 && <span className="rounded-md bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">-{off}%</span>}
            {product.badges.slice(0, 1).map((b) => <Badge key={b} kind={b} />)}
          </div>

          <button
            onClick={() => { wishlist.toggle(product.slug); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart size={16} className={cn(wished && "fill-rose-500 text-rose-500")} />
          </button>

          <button
            onClick={() => setQuickOpen(true)}
            aria-label="Quick view"
            className="glass absolute bottom-3 right-3 grid size-9 place-items-center rounded-full text-foreground opacity-0 transition-all duration-300 hover:bg-brand-500 hover:text-brand-950 group-hover:opacity-100"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">{product.tagline}</p>
          <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug transition-colors hover:text-brand-600 dark:hover:text-brand-400">
            {product.name}
          </Link>
          <Rating value={product.rating} count={product.reviewCount} className="mt-2" size={13} />

          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="pb-0.5 text-sm text-muted line-through">{formatPrice(product.compareAt)}</span>}
          </div>

          <AddToCartButton product={product} variant="full" className="mt-3" />
        </div>
      </motion.article>

      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}

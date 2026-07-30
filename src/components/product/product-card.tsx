"use client";

import { motion } from "framer-motion";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import type { Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { ProductArt } from "./product-art";
import { QuickView } from "./quick-view";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [quickOpen, setQuickOpen] = useState(false);

  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const wished = wishlist.has(product.slug);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
        className="group card-surface relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-card"
      >
        {/* media */}
        <div className="relative m-3 mb-0 overflow-hidden rounded-2xl">
          <Link href={`/product/${product.slug}`} aria-label={product.name}>
            <ProductArt
              category={product.category}
              accent={product.accent}
              className="aspect-square transition-transform duration-500 group-hover:scale-[1.06]"
            />
          </Link>

          {/* badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {off > 0 && (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[0.65rem] font-bold text-white">
                -{off}%
              </span>
            )}
            {product.badges.slice(0, 1).map((b) => (
              <Badge key={b} kind={b} />
            ))}
          </div>

          {/* wishlist */}
          <button
            onClick={() => {
              wishlist.toggle(product.slug);
              toast(wished ? "Removed from wishlist" : "Saved to wishlist");
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="glass absolute right-3 top-3 grid size-9 place-items-center rounded-full transition-colors hover:text-rose-500"
          >
            <Heart size={16} className={cn(wished && "fill-rose-500 text-rose-500")} />
          </button>

          {/* hover actions */}
          <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={() => {
                cart.add(product);
                toast(`${product.name} added to cart`);
              }}
              disabled={!product.inStock}
              className="glass flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors hover:bg-brand-500 hover:text-brand-950 disabled:opacity-50"
            >
              <ShoppingBag size={15} /> {product.inStock ? "Add" : "Sold out"}
            </button>
            <button
              onClick={() => setQuickOpen(true)}
              aria-label="Quick view"
              className="glass grid size-10 place-items-center rounded-full transition-colors hover:bg-brand-500 hover:text-brand-950"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
            {product.tagline}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-1 line-clamp-1 font-display font-semibold transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            {product.name}
          </Link>
          <Rating value={product.rating} count={product.reviewCount} className="mt-2" />
          <div className="mt-3 flex items-end gap-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>
        </div>
      </motion.article>

      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}

"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import type { Category, Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

function badgeFor(p: Product): { text: string; className: string } | null {
  const off = p.compareAt ? discountPercent(p.compareAt, p.price) : 0;
  if (off > 0) return { text: `-${off}%`, className: "bg-rose-500 text-white" };
  if (p.badges.includes("new")) return { text: "New Arrival", className: "bg-lime-300 text-[#1b1d22]" };
  if (p.badges.includes("bestseller")) return { text: "Bestseller", className: "bg-[#1b1d22] text-white" };
  if (p.badges.includes("limited")) return { text: "Limited", className: "bg-amber-400 text-[#1b1d22]" };
  return null;
}

/** Best products of a category: in stock first, then best-selling / newest. */
export function topProducts(products: Product[], slug: string, limit = 7) {
  return products
    .filter((p) => p.category === slug)
    .sort(
      (a, b) =>
        Number(b.inStock) - Number(a.inStock) ||
        Number(!!b.image) - Number(!!a.image) ||
        (b.soldPercent ?? 0) - (a.soldPercent ?? 0) ||
        Number(b.badges.includes("new")) - Number(a.badges.includes("new")),
    )
    .slice(0, limit);
}

/**
 * Category preview panel (shown when hovering a category): a large featured
 * product, a grid of more products with badges, and "View all …".
 */
export function CategoryFlyout({ category, products, onNavigate, className }: { category: Category; products: Product[]; onNavigate?: () => void; className?: string }) {
  const items = topProducts(products, category.slug, 7);
  const [featured, ...rest] = items;

  return (
    <div className={cn("flex h-full flex-col bg-surface p-5", className)}>
      <Link href={`/categories/${category.slug}`} onClick={onNavigate} className="group mb-4 inline-flex w-fit items-center gap-2 text-base font-semibold hover:text-brand-600">
        View all {category.name}
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>

      {!featured ? (
        <p className="grid flex-1 place-items-center text-sm text-muted">New products coming soon.</p>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_2fr] gap-3">
          <Tile product={featured} large onNavigate={onNavigate} />
          <div className="grid grid-cols-3 grid-rows-2 gap-3">
            {rest.slice(0, 6).map((p) => (
              <Tile key={p.slug} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ product, large = false, onNavigate }: { product: Product; large?: boolean; onNavigate?: () => void }) {
  const badge = badgeFor(product);
  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onNavigate}
      className="group relative flex min-h-0 flex-col items-center justify-between overflow-hidden rounded-xl bg-[#f6f6f6] p-3 text-center transition-shadow hover:shadow-card dark:bg-surface-2"
    >
      {badge && <span className={cn("absolute right-0 top-0 z-10 rounded-bl-lg px-2 py-0.5 text-[0.65rem] font-bold", badge.className)}>{badge.text}</span>}
      <ProductImage
        product={product}
        sizes={large ? "280px" : "140px"}
        className={cn("w-full rounded-lg bg-transparent transition-transform duration-300 group-hover:scale-105", large ? "aspect-square max-w-[15rem]" : "aspect-square max-w-[7.5rem]")}
      />
      <div className="mt-2 w-full">
        <p className={cn("line-clamp-1 font-medium", large ? "text-lg font-semibold" : "text-xs")}>{product.name}</p>
        <p className={cn("font-bold text-brand-700 dark:text-brand-300", large ? "text-base" : "text-xs")}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

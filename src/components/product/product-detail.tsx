"use client";

import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import { useRecentlyViewed } from "@/context/recently-viewed";
import type { Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { ProductGallery } from "./product-gallery";
import { Reviews } from "./reviews";

const tabs = ["Description", "Specifications", "Reviews"] as const;

export function ProductDetail({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const recent = useRecentlyViewed();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Description");

  useEffect(() => {
    recent.push(product.slug);
  }, [product.slug, recent]);

  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const wished = wishlist.has(product.slug);

  return (
    <div className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {product.badges.map((b) => <Badge key={b} kind={b} />)}
            {off > 0 && <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[0.65rem] font-bold text-white">-{off}%</span>}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-muted">{product.tagline}</p>
          <Rating value={product.rating} count={product.reviewCount} className="mt-3" size={16} />

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-4xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-lg text-muted line-through">{formatPrice(product.compareAt)}</span>}
          </div>
          <p className={cn("mt-2 text-sm font-semibold", product.inStock ? "text-brand-600 dark:text-brand-400" : "text-rose-500")}>
            {product.inStock ? "● In stock — ships today" : "● Out of stock"}
          </p>

          <p className="mt-5 text-muted">{product.description}</p>

          {/* key features */}
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-brand-500" /> {f}
              </li>
            ))}
          </ul>

          {/* colour */}
          <div className="mt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Colour</span>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                  className="size-9 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: color === c ? "var(--color-brand-500)" : "var(--border)" }}
                />
              ))}
            </div>
          </div>

          {/* qty + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center" aria-label="Decrease"><Minus size={16} /></button>
              <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid size-11 place-items-center" aria-label="Increase"><Plus size={16} /></button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => { cart.add(product, qty, color); toast(`${product.name} added to cart`); }}
            >
              <ShoppingBag size={18} /> Add to cart
            </Button>
            <button
              onClick={() => { wishlist.toggle(product.slug); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
              aria-label="Toggle wishlist"
              className={cn("grid size-13 place-items-center rounded-full border border-border transition-colors hover:border-rose-500", wished && "text-rose-500")}
            >
              <Heart size={20} className={cn(wished && "fill-rose-500")} />
            </button>
          </div>

          {/* trust row */}
          <div className="mt-6 grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free delivery", sub: "Orders over 5K" },
              { icon: ShieldCheck, label: "12-mo warranty", sub: "Genuine product" },
              { icon: RotateCcw, label: "15-day returns", sub: "No questions" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2.5">
                <t.icon size={20} className="text-brand-600 dark:text-brand-400" />
                <div>
                  <p className="text-xs font-semibold">{t.label}</p>
                  <p className="text-[0.7rem] text-muted">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-16">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-5 py-3 text-sm font-semibold transition-colors",
                tab === t ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {t}
              {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "Description" && (
            <div className="max-w-3xl space-y-4 text-muted">
              <p>{product.description}</p>
              <p>Every Oraimo product is engineered for daily life and rigorously tested for durability, then backed by a 12-month warranty and responsive local support. This unit ships in fully recyclable packaging with all cables and documentation included.</p>
            </div>
          )}
          {tab === "Specifications" && (
            <div className="max-w-2xl overflow-hidden rounded-2xl border border-border">
              {Object.entries(product.specs).map(([k, v], i) => (
                <div key={k} className={cn("flex justify-between gap-4 px-5 py-3.5 text-sm", i % 2 === 0 && "bg-surface")}>
                  <span className="text-muted">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Reviews" && <Reviews product={product} />}
        </div>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import type { Product } from "@/lib/types";
import { discountPercent, formatPrice } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const cart = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0]);

  useEffect(() => {
    if (open) setQty(1);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="card-surface relative z-10 grid w-full max-w-3xl gap-6 overflow-hidden p-4 sm:grid-cols-2 sm:p-6"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="glass absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full"
            >
              <X size={16} />
            </button>

            <ProductImage product={product} className="aspect-square rounded-2xl" />

            <div className="flex flex-col">
              <span className="eyebrow">{product.tagline}</span>
              <h3 className="mt-2 text-2xl font-bold">{product.name}</h3>
              <Rating value={product.rating} count={product.reviewCount} className="mt-2" />

              <div className="mt-4 flex items-end gap-2">
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                {product.compareAt && (
                  <span className="text-muted line-through">{formatPrice(product.compareAt)}</span>
                )}
                {off > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-500">
                    Save {off}%
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-muted">{product.description}</p>

              {/* colours */}
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Colour</span>
                <div className="mt-2 flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      aria-label={`Colour ${c}`}
                      className="size-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: c, borderColor: color === c ? "var(--color-brand-500)" : "transparent" }}
                    />
                  ))}
                </div>
              </div>

              {/* qty + add */}
              <div className="mt-auto flex items-center gap-3 pt-6">
                <div className="flex items-center rounded-full border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-10 place-items-center" aria-label="Decrease">
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="grid size-10 place-items-center" aria-label="Increase">
                    <Plus size={15} />
                  </button>
                </div>
                <Button
                  className="flex-1"
                  disabled={!product.inStock}
                  onClick={() => {
                    cart.add(product, qty, color);
                    toast(`${product.name} added to cart`);
                    onClose();
                  }}
                >
                  <ShoppingBag size={16} /> {product.inStock ? "Add to cart" : "Sold out"}
                </Button>
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                <Check size={14} /> View full details
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

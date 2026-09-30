"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart";
import { playCartSound } from "@/lib/cart-sound";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Variant = "full" | "lg" | "icon";

const MAX_QTY = 99;

const heights: Record<Variant, string> = {
  full: "h-11 text-sm",
  lg: "h-13 text-base",
  icon: "h-9 text-sm",
};

/**
 * Walmart-style Add to cart: tap once and the button itself becomes a
 * "−  2 added  +" stepper, so the shopper stays exactly where they are — no
 * pop-up, no redirect. The header cart badge updates instantly.
 */
export function AddToCartButton({
  product,
  color,
  variant = "full",
  className,
}: {
  product: Product;
  /** kept for backwards compatibility; the stepper now controls quantity */
  quantity?: number;
  color?: string;
  variant?: Variant;
  className?: string;
}) {
  const cart = useCart();
  const inCart = cart.hydrated ? cart.lines.find((l) => l.product.slug === product.slug)?.quantity ?? 0 : 0;
  const max = Math.min(MAX_QTY, typeof product.stock === "number" && product.stock > 0 ? product.stock : MAX_QTY);
  const soldOut = !product.inStock;
  const icon = variant === "icon";

  if (soldOut) {
    return (
      <button type="button" disabled className={cn("inline-flex items-center justify-center rounded-full bg-surface-2 px-4 font-semibold text-muted", heights[variant], icon ? "px-3 text-xs" : "w-full", className)}>
        Sold out
      </button>
    );
  }

  if (inCart === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          cart.add(product, 1, color);
          playCartSound();
        }}
        aria-label={icon ? `Add ${product.name} to cart` : undefined}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full bg-cta font-bold text-white transition-[background-color,transform] duration-150 hover:bg-cta-600 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          heights[variant],
          icon ? "w-9 shadow-lg" : "w-full px-5",
          className,
        )}
      >
        {icon ? <Plus size={18} strokeWidth={2.75} /> : <><ShoppingCart size={17} /> Add to cart</>}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`${product.name} quantity in cart`}
      className={cn(
        "inline-flex select-none items-center justify-between rounded-full bg-cta font-bold text-white",
        heights[variant],
        icon ? "w-[6.5rem] shadow-lg" : "w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => cart.setQuantity(product.slug, inCart - 1)}
        aria-label={inCart === 1 ? `Remove ${product.name} from cart` : "Decrease quantity"}
        className={cn("grid h-full place-items-center rounded-full transition-colors hover:bg-white/15", icon ? "w-9" : "w-12")}
      >
        <Minus size={icon ? 16 : 20} strokeWidth={2.5} />
      </button>
      <span aria-live="polite" className="whitespace-nowrap tabular-nums">
        {inCart}{icon ? "" : " added"}
      </span>
      <button
        type="button"
        onClick={() => {
          if (inCart < max) {
            cart.setQuantity(product.slug, inCart + 1);
            playCartSound();
          }
        }}
        disabled={inCart >= max}
        aria-label="Increase quantity"
        className={cn("grid h-full place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40", icon ? "w-9" : "w-12")}
      >
        <Plus size={icon ? 16 : 20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

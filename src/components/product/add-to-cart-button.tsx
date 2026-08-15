"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "@/context/cart";
import { useCartDrawer } from "@/context/cart-drawer";
import { useToast } from "@/context/toast";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "added";
type Variant = "full" | "lg" | "icon";

const sizeClasses: Record<Variant, string> = {
  full: "h-11 px-5 text-sm gap-2 w-full",
  lg: "h-13 px-8 text-base gap-2.5",
  icon: "size-10",
};

export function AddToCartButton({
  product,
  quantity = 1,
  color,
  variant = "full",
  className,
}: {
  product: Product;
  quantity?: number;
  color?: string;
  variant?: Variant;
  className?: string;
}) {
  const cart = useCart();
  const toast = useToast();
  const { openCart } = useCartDrawer();
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconOnly = variant === "icon";
  const soldOut = !product.inStock;

  const handle = () => {
    if (state !== "idle" || soldOut) return;
    setState("loading");
    if (timer.current) clearTimeout(timer.current);
    // brief, deliberate loading beat so the feedback is felt, not skipped
    timer.current = setTimeout(() => {
      cart.add(product, quantity, color);
      toast(`${product.name} added to cart`);
      openCart(); // slide out the cart so it feels real
      setState("added");
      timer.current = setTimeout(() => setState("idle"), 1500);
    }, 420);
  };

  const label = soldOut ? "Sold out" : state === "added" ? "Added" : state === "loading" ? "Adding…" : "Add to cart";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={soldOut || state === "loading"}
      aria-label={iconOnly ? `Add ${product.name} to cart` : undefined}
      aria-live="polite"
      data-state={state}
      className={cn(
        "group/atc relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-semibold",
        "transition-[transform,box-shadow,background-color,color] duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.96] disabled:cursor-not-allowed",
        sizeClasses[variant],
        soldOut
          ? "bg-surface-2 text-muted"
          : state === "added"
            ? "bg-brand-600 text-white shadow-[0_8px_24px_-8px_var(--color-brand-600)]"
            : "bg-brand-500 text-brand-950 shadow-[0_6px_18px_-8px_var(--color-brand-500)] hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-[0_14px_30px_-10px_var(--color-brand-500)]",
        className,
      )}
    >
      {/* sheen sweep on hover */}
      {!soldOut && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/atc:translate-x-full" />
      )}

      <span className="relative flex items-center justify-center" style={{ gap: iconOnly ? 0 : undefined }}>
        <AnimatePresence mode="wait" initial={false}>
          {state === "loading" ? (
            <motion.span key="loading" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
              <Loader2 size={iconOnly ? 17 : 16} className="animate-spin" />
              {!iconOnly && <span>Adding…</span>}
            </motion.span>
          ) : state === "added" ? (
            <motion.span key="added" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} className="flex items-center gap-2">
              <Check size={iconOnly ? 18 : 16} strokeWidth={3} />
              {!iconOnly && <span>Added</span>}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
              <ShoppingBag size={iconOnly ? 17 : 16} className="transition-transform duration-200 group-hover/atc:-rotate-6" />
              {!iconOnly && <span>{label}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

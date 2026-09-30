"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, ShieldCheck, Truck, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/context/cart";
import { useCartDrawer } from "@/context/cart-drawer";
import { useCatalog } from "@/context/catalog";
import { setSoundEnabled, soundEnabled } from "@/lib/cart-sound";
import { formatPrice } from "@/lib/utils";
import { Portal } from "@/hooks/use-overlay";

/**
 * "Added to cart" confirmation — what shoppers see right after tapping Add to
 * cart (Amazon / Walmart pattern). Shows the item, the cart total, free-delivery
 * progress and clear next steps: Checkout, View cart or keep shopping, plus a
 * few items that go well with it. Bottom sheet on phones, card on desktop.
 */
export function AddedToCart() {
  const { added, hideAdded, setOpen } = useCartDrawer();
  const cart = useCart();
  const { products } = useCatalog();
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundEnabled()), []);

  // close on Escape
  useEffect(() => {
    if (!added) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hideAdded();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [added, hideAdded]);

  const p = added?.product;
  const remaining = Math.max(0, cart.freeShipThreshold - cart.subtotal);
  const inCart = new Set(cart.lines.map((l) => l.product.slug));
  const suggestions = p
    ? products.filter((x) => x.category === p.category && x.slug !== p.slug && !inCart.has(x.slug) && x.inStock).slice(0, 3)
    : [];

  return (
    <Portal>
      <AnimatePresence>
        {added && p && (
          <>
            <motion.div
              key="added-backdrop"
              className="fixed inset-0 z-[110] bg-black/40 sm:bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideAdded}
            />
            <motion.div
              key={added.key}
              role="dialog"
              aria-label="Added to cart"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[111] max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-[25rem] sm:rounded-2xl sm:p-5"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />

              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} className="fill-emerald-500 text-white" /> Added to cart
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setSoundEnabled(!sound); setSound(!sound); }}
                    aria-label={sound ? "Mute cart sound" : "Unmute cart sound"}
                    title={sound ? "Sound on" : "Sound off"}
                    className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2"
                  >
                    {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button onClick={hideAdded} aria-label="Close" className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* the item */}
              <div className="mt-3 flex gap-3">
                <ProductImage product={p} sizes="80px" glow={false} className="size-20 shrink-0 rounded-xl border border-border" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted">Qty {added.quantity}</p>
                  <p className="mt-1 font-bold text-brand-600">{formatPrice(p.price * added.quantity)}</p>
                </div>
              </div>

              {/* cart summary + free delivery */}
              <div className="mt-4 rounded-xl bg-surface-2 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Cart subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})</span>
                  <span className="font-bold tabular-nums">{formatPrice(cart.subtotal)}</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs">
                  <Truck size={14} className="shrink-0 text-brand-500" />
                  {remaining > 0 ? (
                    <span>Add <b>{formatPrice(remaining)}</b> more for <b>FREE delivery</b></span>
                  ) : (
                    <b className="text-emerald-600 dark:text-emerald-400">You qualify for FREE delivery</b>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${cart.freeShipProgress}%` }} />
                </div>
              </div>

              {/* next steps */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { hideAdded(); setOpen(true); }}
                  className="h-11 rounded-full border border-border text-sm font-semibold transition-colors hover:border-foreground/40 hover:bg-surface-2"
                >
                  View cart
                </button>
                <Link
                  href="/checkout"
                  onClick={hideAdded}
                  className="grid h-11 place-items-center rounded-full bg-cta text-sm font-bold text-white transition-colors hover:bg-cta-600"
                >
                  Checkout
                </Link>
              </div>
              <button onClick={hideAdded} className="mt-2 w-full py-2 text-center text-sm font-semibold text-brand-600 hover:underline">
                Continue shopping
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
                <ShieldCheck size={13} /> Genuine product · 12-month warranty · Pay on delivery or M-Pesa
              </p>

              {suggestions.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Customers also bought</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {suggestions.map((s) => (
                      <Link key={s.slug} href={`/product/${s.slug}`} onClick={hideAdded} className="group block">
                        <ProductImage product={s} sizes="110px" glow={false} className="aspect-square rounded-lg border border-border" />
                        <p className="mt-1 line-clamp-1 text-xs font-medium group-hover:text-brand-600">{s.name}</p>
                        <p className="text-xs font-bold">{formatPrice(s.price)}</p>
                      </Link>
                    ))}
                  </div>
                  <Link href={`/categories/${p.category}`} onClick={hideAdded} className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:underline">
                    See more like this <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}

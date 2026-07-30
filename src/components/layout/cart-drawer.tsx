"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";

const FREE_SHIP = 5000;

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCart();
  const remaining = Math.max(0, FREE_SHIP - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / FREE_SHIP) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[96] flex w-[min(92vw,26rem)] flex-col bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShoppingBag size={18} /> Your cart
                <span className="text-muted">({cart.count})</span>
              </h2>
              <button onClick={onClose} aria-label="Close cart" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
                <X size={18} />
              </button>
            </header>

            {cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-surface-2 text-muted">
                  <ShoppingBag size={26} />
                </div>
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-sm text-muted">Add something brilliant to get started.</p>
                <Button asChild onClick={onClose}>
                  <Link href="/shop">Browse the shop</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="border-b border-border p-4">
                  <p className="text-xs text-muted">
                    {remaining > 0 ? (
                      <>Add <b className="text-foreground">{formatPrice(remaining)}</b> for free shipping</>
                    ) : (
                      <b className="text-brand-600 dark:text-brand-400">You&apos;ve unlocked free shipping! 🎉</b>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-border overflow-y-auto">
                  {cart.lines.map((line) => (
                    <li key={line.product.slug} className="flex gap-3 p-4">
                      <ProductImage product={line.product} className="size-20 shrink-0 rounded-xl" glow={false} />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link href={`/product/${line.product.slug}`} onClick={onClose} className="line-clamp-1 text-sm font-semibold hover:text-brand-600">
                            {line.product.name}
                          </Link>
                          <button onClick={() => cart.remove(line.product.slug)} aria-label="Remove" className="text-muted hover:text-rose-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="text-xs text-muted">{formatPrice(line.product.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button onClick={() => cart.setQuantity(line.product.slug, line.quantity - 1)} className="grid size-7 place-items-center" aria-label="Decrease">
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold tabular-nums">{line.quantity}</span>
                            <button onClick={() => cart.setQuantity(line.product.slug, line.quantity + 1)} className="grid size-7 place-items-center" aria-label="Increase">
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-bold">{formatPrice(line.product.price * line.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="space-y-3 border-t border-border p-5">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <Button asChild className="w-full" size="lg" onClick={onClose}>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full" onClick={onClose}>
                    <Link href="/cart">View full cart</Link>
                  </Button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

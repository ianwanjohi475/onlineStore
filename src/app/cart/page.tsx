"use client";

import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/cart/order-summary";
import { ProductImage } from "@/components/product/product-image";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const remaining = Math.max(0, cart.freeShipThreshold - cart.subtotal);

  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-surface-2 text-muted"><ShoppingBag size={34} /></div>
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-muted">Looks like you haven&apos;t added anything yet. Let&apos;s fix that.</p>
        <Button asChild size="lg"><Link href="/shop">Start shopping <ArrowRight size={18} /></Link></Button>
        <div className="w-full"><RecentlyViewed /></div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your cart</h1>
          <p className="mt-1 text-muted">{cart.count} item{cart.count !== 1 && "s"} in your bag</p>
        </div>
        {cart.lines.length > 0 && (
          <button onClick={() => { cart.clear(); toast("Cart cleared"); }} className="text-sm font-semibold text-muted hover:text-rose-500">
            Clear cart
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {/* free shipping progress */}
          <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-sm">
              <Truck size={16} className="text-brand-500" />
              {remaining > 0
                ? <>Add <b>{formatPrice(remaining)}</b> more for <b className="text-brand-600 dark:text-brand-400">free shipping</b></>
                : <b className="text-brand-600 dark:text-brand-400">You&apos;ve unlocked free shipping 🎉</b>}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${cart.freeShipProgress}%` }} />
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {cart.lines.map((line) => (
              <li key={line.product.slug} className="card-surface flex gap-4 p-4">
                <Link href={`/product/${line.product.slug}`} className="shrink-0">
                  <ProductImage product={line.product} glow={false} className="size-28 rounded-2xl" sizes="112px" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${line.product.slug}`} className="font-display font-semibold hover:text-brand-600 dark:hover:text-brand-400">
                        {line.product.name}
                      </Link>
                      <p className="text-xs text-muted">{line.product.tagline}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="font-semibold">{formatPrice(line.product.price)}</span>
                        {line.product.compareAt && <span className="text-xs text-muted line-through">{formatPrice(line.product.compareAt)}</span>}
                      </div>
                    </div>
                    <button onClick={() => cart.remove(line.product.slug)} aria-label="Remove" className="text-muted hover:text-rose-500">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button onClick={() => cart.setQuantity(line.product.slug, line.quantity - 1)} className="grid size-9 place-items-center" aria-label="Decrease"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                        <button onClick={() => cart.setQuantity(line.product.slug, line.quantity + 1)} className="grid size-9 place-items-center" aria-label="Increase"><Plus size={14} /></button>
                      </div>
                      <button
                        onClick={() => { wishlist.toggle(line.product.slug); cart.remove(line.product.slug); toast("Saved for later"); }}
                        className="hidden items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400 sm:flex"
                      >
                        <Heart size={13} /> Save for later
                      </button>
                    </div>
                    <span className="font-bold">{formatPrice(line.product.price * line.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit lg:sticky lg:top-32">
          <OrderSummary>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full"><Link href="/checkout">Checkout <ArrowRight size={18} /></Link></Button>
              <Button asChild variant="ghost" className="w-full"><Link href="/shop">Continue shopping</Link></Button>
            </div>
          </OrderSummary>
        </aside>
      </div>

      <RecentlyViewed />
    </div>
  );
}

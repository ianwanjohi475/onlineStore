"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductArt } from "@/components/product/product-art";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/utils";

const SHIPPING = 300;
const FREE_SHIP = 5000;

export default function CartPage() {
  const cart = useCart();
  const shipping = cart.subtotal >= FREE_SHIP || cart.subtotal === 0 ? 0 : SHIPPING;
  const total = cart.subtotal + shipping;

  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-surface-2 text-muted">
          <ShoppingBag size={34} />
        </div>
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-muted">Looks like you haven&apos;t added anything yet. Let&apos;s fix that.</p>
        <Button asChild size="lg"><Link href="/shop">Start shopping <ArrowRight size={18} /></Link></Button>
        <div className="w-full"><RecentlyViewed /></div>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Your cart</h1>
      <p className="mt-1 text-muted">{cart.count} item{cart.count !== 1 && "s"} in your bag</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="flex flex-col gap-4">
          {cart.lines.map((line) => (
            <li key={line.product.slug} className="card-surface flex gap-4 p-4">
              <ProductArt category={line.product.category} accent={line.product.accent} className="size-28 shrink-0 rounded-2xl" glow={false} />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${line.product.slug}`} className="font-display font-semibold hover:text-brand-600 dark:hover:text-brand-400">
                      {line.product.name}
                    </Link>
                    <p className="text-xs text-muted">{line.product.tagline}</p>
                  </div>
                  <button onClick={() => cart.remove(line.product.slug)} aria-label="Remove" className="text-muted hover:text-rose-500">
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button onClick={() => cart.setQuantity(line.product.slug, line.quantity - 1)} className="grid size-9 place-items-center" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                    <button onClick={() => cart.setQuantity(line.product.slug, line.quantity + 1)} className="grid size-9 place-items-center" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-bold">{formatPrice(line.product.price * line.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg font-bold">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-display font-bold tabular-nums">{formatPrice(total)}</dd></div>
            </dl>
            <Button asChild size="lg" className="mt-5 w-full"><Link href="/checkout">Checkout <ArrowRight size={18} /></Link></Button>
            <Button asChild variant="ghost" className="mt-2 w-full"><Link href="/shop">Continue shopping</Link></Button>
            <p className="mt-4 text-center text-xs text-muted">Secure checkout · M-Pesa & cards · 15-day returns</p>
          </div>
        </aside>
      </div>

      <RecentlyViewed />
    </div>
  );
}

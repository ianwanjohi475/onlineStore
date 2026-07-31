"use client";

import { Check, Lock, Tag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { cn, formatPrice } from "@/lib/utils";

export function OrderSummary({ children, className }: { children?: React.ReactNode; className?: string }) {
  const cart = useCart();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submitPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = cart.applyPromo(code);
    if (ok) { toast("Promo applied 🎉"); setCode(""); setError(false); }
    else { setError(true); }
  };

  return (
    <div className={cn("card-surface p-6", className)}>
      <h2 className="font-display text-lg font-bold">Order summary</h2>

      {/* promo */}
      <div className="mt-4">
        {cart.promoCode ? (
          <div className="flex items-center justify-between rounded-xl border border-brand-500/40 bg-brand-500/10 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
              <Check size={15} /> {cart.promoCode} · {cart.promoLabel}
            </span>
            <button onClick={cart.clearPromo} aria-label="Remove promo" className="text-muted hover:text-rose-500">
              <X size={15} />
            </button>
          </div>
        ) : (
          <form onSubmit={submitPromo} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                placeholder="Promo code"
                className={cn(
                  "h-10 w-full rounded-xl border bg-surface pl-9 pr-3 text-sm uppercase outline-none transition-colors focus:border-brand-500",
                  error ? "border-rose-500" : "border-border",
                )}
              />
            </div>
            <button type="submit" className="rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400">
              Apply
            </button>
          </form>
        )}
        {error && <p className="mt-1.5 text-xs text-rose-500">That code isn&apos;t valid. Try ORAIMO10 or FREESHIP.</p>}
        {!cart.promoCode && !error && <p className="mt-1.5 text-xs text-muted">Try <b className="text-foreground">ORAIMO10</b> for 10% off.</p>}
      </div>

      {/* breakdown */}
      <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</dd></div>
        {cart.savings > 0 && (
          <div className="flex justify-between text-brand-600 dark:text-brand-400"><dt>Item savings</dt><dd className="font-semibold tabular-nums">−{formatPrice(cart.savings)}</dd></div>
        )}
        {cart.discount > 0 && (
          <div className="flex justify-between text-brand-600 dark:text-brand-400"><dt>Promo ({cart.promoCode})</dt><dd className="font-semibold tabular-nums">−{formatPrice(cart.discount)}</dd></div>
        )}
        <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="font-semibold">{cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}</dd></div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-display text-xl font-bold tabular-nums">{formatPrice(cart.total)}</dd></div>
      </dl>

      {children}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
        <Lock size={13} /> Secure checkout · M-Pesa &amp; cards · 15-day returns
      </div>
    </div>
  );
}

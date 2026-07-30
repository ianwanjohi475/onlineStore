"use client";

import { Check, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/context/cart";
import { cn, formatPrice } from "@/lib/utils";

const steps = ["Details", "Payment", "Review"] as const;
const SHIPPING = 300;
const FREE_SHIP = 5000;

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="h-11 rounded-xl border border-border bg-surface px-4 outline-none transition-colors focus:border-brand-500"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState<"mpesa" | "card">("mpesa");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  const shipping = cart.subtotal >= FREE_SHIP ? 0 : SHIPPING;
  const total = cart.subtotal + shipping;

  if (done) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
          <Check size={40} />
        </div>
        <h1 className="font-display text-3xl font-bold">Order confirmed 🎉</h1>
        <p className="max-w-md text-muted">
          Thank you! Your order <b className="text-foreground">#ORA-{Math.floor(100000 + Math.random() * 900000)}</b> is
          confirmed. We&apos;ve sent tracking details to your phone and email.
        </p>
        <div className="flex gap-3">
          <Button asChild><Link href="/track-order">Track order</Link></Button>
          <Button asChild variant="outline"><Link href="/shop">Keep shopping</Link></Button>
        </div>
      </div>
    );
  }

  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <p className="text-muted">Your cart is empty.</p>
        <Button asChild><Link href="/shop">Browse products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>

      {/* stepper */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors", i <= step ? "bg-brand-500 text-brand-950" : "bg-surface-2 text-muted")}>
              {i < step ? <Check size={16} /> : i + 1}
            </span>
            <span className={cn("text-sm font-semibold", i <= step ? "text-foreground" : "text-muted")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-brand-500" : "bg-border")} />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="card-surface p-6">
          {step === 0 && (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
              <Field label="Full name" required placeholder="Jane Wanjiru" className="sm:col-span-2" />
              <Field label="Email" type="email" required placeholder="jane@email.com" />
              <Field label="Phone" type="tel" required placeholder="+254 7…" />
              <Field label="Delivery address" required placeholder="Street, building, apt" className="sm:col-span-2" />
              <Field label="City / Town" required placeholder="Nairobi" />
              <Field label="Postal code" placeholder="00100" />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full">Continue to payment</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-bold">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "mpesa" as const, icon: Smartphone, label: "M-Pesa", sub: "Pay via STK push" },
                  { id: "card" as const, icon: CreditCard, label: "Card", sub: "Visa / Mastercard" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPay(m.id)}
                    className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors", pay === m.id ? "border-brand-500 bg-brand-500/8" : "border-border hover:border-brand-500/50")}
                  >
                    <m.icon size={22} className="text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-xs text-muted">{m.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              {pay === "mpesa" ? (
                <Field label="M-Pesa phone number" type="tel" placeholder="+254 7…" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Card number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Field label="Expiry" placeholder="MM / YY" />
                  <Field label="CVC" placeholder="123" />
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Review order</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-bold">Review &amp; place order</h2>
              <ul className="divide-y divide-border">
                {cart.lines.map((l) => (
                  <li key={l.product.slug} className="flex items-center gap-3 py-3">
                    <ProductImage product={l.product} className="size-14 rounded-xl" glow={false} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{l.product.name}</p>
                      <p className="text-xs text-muted">Qty {l.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">{formatPrice(l.product.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted">
                <Lock size={14} /> Payments are encrypted end-to-end. You can cancel within 1 hour.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1"
                  disabled={placing}
                  onClick={() => {
                    setPlacing(true);
                    setTimeout(() => { cart.clear(); setDone(true); }, 1600);
                  }}
                >
                  {placing ? <><Loader2 size={18} className="animate-spin" /> Placing…</> : <>Place order · {formatPrice(total)}</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg font-bold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-display font-bold tabular-nums">{formatPrice(total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

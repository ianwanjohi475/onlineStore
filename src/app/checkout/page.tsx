"use client";

import { Banknote, Check, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/cart/order-summary";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/context/cart";
import { cn, formatPrice } from "@/lib/utils";

const steps = ["Details", "Payment", "Review"] as const;

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
  const [pay, setPay] = useState<"mpesa" | "card" | "cod">("mpesa");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", city: "" });

  if (done) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
          <Check size={40} />
        </div>
        <h1 className="font-display text-3xl font-bold">Order confirmed 🎉</h1>
        <p className="max-w-md text-muted">
          Thank you! Your order <b className="text-foreground">{orderNo || "confirmed"}</b> is
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
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setCustomer({
                  name: String(f.get("name") || ""),
                  email: String(f.get("email") || ""),
                  phone: String(f.get("phone") || ""),
                  address: String(f.get("address") || ""),
                  city: String(f.get("city") || ""),
                });
                setStep(1);
              }}
            >
              <Field name="name" label="Full name" required placeholder="Jane Wanjiru" className="sm:col-span-2" />
              <Field name="email" label="Email" type="email" required placeholder="jane@email.com" />
              <Field name="phone" label="Phone" type="tel" required placeholder="+254 7…" />
              <Field name="address" label="Delivery address" required placeholder="Street, building, apt" className="sm:col-span-2" />
              <Field name="city" label="City / Town" required placeholder="Nairobi" />
              <Field name="postal" label="Postal code" placeholder="00100" />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full">Continue to payment</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-bold">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "mpesa" as const, icon: Smartphone, label: "M-Pesa", sub: "Pay via STK push" },
                  { id: "card" as const, icon: CreditCard, label: "Card", sub: "Visa / Mastercard" },
                  { id: "cod" as const, icon: Banknote, label: "Cash on delivery", sub: "Pay when it arrives" },
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
              {pay === "mpesa" && <Field label="M-Pesa phone number" type="tel" placeholder="+254 7…" />}
              {pay === "card" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Card number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Field label="Expiry" placeholder="MM / YY" />
                  <Field label="CVC" placeholder="123" />
                </div>
              )}
              {pay === "cod" && (
                <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">Pay in cash when your order is delivered. Please have the exact amount ready.</p>
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
              {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1"
                  disabled={placing}
                  onClick={async () => {
                    setPlacing(true);
                    setError("");
                    const payload = {
                      items: cart.lines.map((l) => ({ slug: l.product.slug, name: l.product.name, quantity: l.quantity, price: l.product.price })),
                      subtotal: cart.subtotal,
                      shipping: cart.shipping,
                      discount: cart.discount,
                      total: cart.total,
                      payment: pay === "mpesa" ? "M-Pesa" : pay === "card" ? "Card" : "Cash on Delivery",
                      customer,
                    };
                    try {
                      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                      const d = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(d.error || "Could not place your order.");
                      setOrderNo(d.number || "");
                      cart.clear();
                      setDone(true);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not place your order. Please try again.");
                      setPlacing(false);
                    }
                  }}
                >
                  {placing ? <><Loader2 size={18} className="animate-spin" /> Placing…</> : <>Place order · {formatPrice(cart.total)}</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-32">
          <div className="card-surface p-5">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">
              {cart.count} item{cart.count !== 1 && "s"}
            </h2>
            <ul className="flex flex-col gap-3">
              {cart.lines.map((l) => (
                <li key={l.product.slug} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <ProductImage product={l.product} glow={false} className="size-14 rounded-xl" sizes="56px" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">{l.quantity}</span>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm">{l.product.name}</p>
                  <span className="text-sm font-semibold">{formatPrice(l.product.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}

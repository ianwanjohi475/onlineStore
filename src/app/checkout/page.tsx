"use client";

import { Banknote, Check, Loader2, Lock, Smartphone } from "lucide-react";
import { MpesaPrompt, type PromptInfo } from "@/components/checkout/mpesa-prompt";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/cart/order-summary";
import { ProductImage } from "@/components/product/product-image";
import { useAuth } from "@/context/auth";
import { useCatalog } from "@/context/catalog";
import { useCart } from "@/context/cart";
import { rememberOrder } from "@/hooks/use-my-orders";
import { OrderCard } from "@/components/orders/order-card";
import type { PublicOrder } from "@/lib/order-public";
import { cn, formatPrice } from "@/lib/utils";

const steps = ["Details", "Payment", "Review"] as const;

function Field({ label, className, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
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
  const { user, ready } = useAuth();
  const { settings } = useCatalog();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState<"mpesa" | "cod">("mpesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  // M-Pesa "pay now" prompt to the customer's phone (when the shop has it set up)
  const [stkEnabled, setStkEnabled] = useState(false);
  const [manual, setManual] = useState(false);
  const [payPhone, setPayPhone] = useState("");
  const [payInfo, setPayInfo] = useState<PromptInfo | null>(null);
  useEffect(() => {
    fetch("/api/mpesa/pay", { cache: "no-store" }).then((r) => r.json()).then((d) => setStkEnabled(!!d.enabled)).catch(() => {});
  }, []);
  const usePrompt = pay === "mpesa" && stkEnabled && !manual;

  if (done) {
    return <OrderPlaced number={orderNo} pay={payInfo} />;
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
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors", i <= step ? "bg-brand-500 text-white" : "bg-surface-2 text-muted")}>
              {i < step ? <Check size={16} /> : i + 1}
            </span>
            <span className={cn("text-sm font-semibold", i <= step ? "text-foreground" : "text-muted")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-brand-500" : "bg-border")} />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="card-surface p-6">
          {step === 0 && ready && !user && (
            <p className="mb-5 rounded-xl bg-brand-50 p-3 text-sm dark:bg-brand-500/10">
              <Link href="/account" className="font-semibold text-brand-600 hover:underline">Sign in</Link> to fill in your details and see this order on every device — or continue as a guest.
            </p>
          )}
          {step === 0 && (
            <form
              key={user?.id ?? "guest"}
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
                if (!payPhone) setPayPhone(String(f.get("phone") || ""));
                setStep(1);
              }}
            >
              <Field name="name" label="Full name" required autoComplete="name" defaultValue={customer.name || user?.name} placeholder="Jane Wanjiru" className="sm:col-span-2" />
              <Field name="email" label="Email" type="email" required autoComplete="email" defaultValue={customer.email || user?.email} placeholder="jane@email.com" />
              <Field name="phone" label="Phone" type="tel" required autoComplete="tel" defaultValue={customer.phone || user?.phone} placeholder="+254 7…" />
              <Field name="address" label="Delivery address" required autoComplete="street-address" defaultValue={customer.address} placeholder="Street, building, apt" className="sm:col-span-2" />
              <Field name="city" label="City / Town" required autoComplete="address-level2" defaultValue={customer.city} placeholder="Nairobi" />
              <Field name="postal" label="Postal code" placeholder="00100" />
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
                  { id: "mpesa" as const, icon: Smartphone, label: "M-Pesa", sub: stkEnabled ? "Pay now — prompt on your phone" : "Lipa na M-Pesa · Till" },
                  { id: "cod" as const, icon: Banknote, label: "Cash on delivery", sub: "Pay when it arrives" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPay(m.id)}
                    aria-pressed={pay === m.id}
                    className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors", pay === m.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-border hover:border-brand-500/50")}
                  >
                    <m.icon size={22} className="shrink-0 text-brand-600 dark:text-brand-400" />
                    <div className="min-w-0">
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-xs text-muted">{m.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              {usePrompt && (
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Pay with M-Pesa — no Till number to type</p>
                  <p className="text-sm">When you place your order we&apos;ll send an M-Pesa request for <b>{formatPrice(cart.total)}</b> to this phone. Just enter your M-Pesa PIN.</p>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">M-Pesa phone number</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={payPhone}
                      onChange={(e) => setPayPhone(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 16))}
                      placeholder="0712 345 678"
                      autoComplete="tel"
                      className="h-11 rounded-xl border border-border bg-surface px-4 text-base tracking-wide outline-none focus:border-brand-500"
                    />
                  </label>
                  <button type="button" onClick={() => setManual(true)} className="self-start text-xs font-semibold text-brand-600 hover:underline">
                    Prefer to pay to our Till number yourself?
                  </button>
                </div>
              )}
              {pay === "mpesa" && !usePrompt && (
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">How to pay with M-Pesa</p>
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    <li>Open <b>M-Pesa</b> → <b>Lipa na M-Pesa</b> → <b>Buy Goods and Services</b></li>
                    <li>
                      Till number:{" "}
                      {settings.mpesaTill ? (
                        <b className="rounded bg-white px-1.5 py-0.5 font-mono text-base tracking-wider text-[#111] dark:bg-black/30 dark:text-white">{settings.mpesaTill}</b>
                      ) : (
                        <b>we&apos;ll send it to you on WhatsApp</b>
                      )}
                      {settings.mpesaTillName && <span className="text-muted"> ({settings.mpesaTillName})</span>}
                    </li>
                    <li>Amount: <b>{formatPrice(cart.total)}</b>, then enter your M-Pesa PIN</li>
                  </ol>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">M-Pesa confirmation code <span className="font-normal text-muted">(from the SMS — optional)</span></span>
                    <input
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                      placeholder="e.g. QJK3ABC12D"
                      autoComplete="off"
                      className="h-11 rounded-xl border border-border bg-surface px-4 font-mono uppercase tracking-wider outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:border-brand-500"
                    />
                  </label>
                  <p className="text-xs text-muted">You can also pay after placing the order. We confirm every payment and update your order straight away.</p>
                  {stkEnabled && (
                    <button type="button" onClick={() => setManual(false)} className="self-start text-xs font-semibold text-brand-600 hover:underline">
                      Get an M-Pesa prompt on my phone instead
                    </button>
                  )}
                </div>
              )}
              {pay === "cod" && (
                <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">Pay in cash (or M-Pesa) when your order is delivered. Please have the exact amount ready.</p>
              )}
              {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setError(""); setStep(0); }}>Back</Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (usePrompt && !/^(?:\+?254|0)?[71]\d{8}$/.test(payPhone.replace(/\s/g, ""))) {
                      setError("Enter a valid Safaricom number, e.g. 0712 345 678.");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                >
                  Review order
                </Button>
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
                <Lock size={14} /> Pay only to our official Till number or in cash on delivery. You can cancel within 1 hour.
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
                      promoCode: cart.promoCode,
                      total: cart.total,
                      payment: pay === "mpesa" ? "M-Pesa" : "Cash on Delivery",
                      mpesaCode: pay === "mpesa" && !usePrompt ? mpesaCode : undefined,
                      stk: usePrompt,
                      mpesaPhone: usePrompt ? payPhone : undefined,
                      customer,
                    };
                    try {
                      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                      const d = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(d.error || "Could not place your order.");
                      setOrderNo(d.number || "");
                      if (d.prompt && d.t) setPayInfo({ number: d.number, t: d.t, total: d.total, ...d.prompt });
                      rememberOrder(d.number || "");
                      cart.clear();
                      setDone(true);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Could not place your order. Please try again.");
                      setPlacing(false);
                    }
                  }}
                >
                  {placing ? <><Loader2 size={18} className="animate-spin" /> {usePrompt ? "Sending M-Pesa prompt…" : "Placing…"}</> : <>{usePrompt ? "Place order & pay" : "Place order"} · {formatPrice(cart.total)}</>}
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

/** Confirmation screen: the new order with its live tracker, plus next steps. */
function OrderPlaced({ number, pay }: { number: string; pay: PromptInfo | null }) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!number) return;
    fetch(`/api/track?number=${encodeURIComponent(number)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOrder(d))
      .catch(() => {});
  }, [number, reload]);

  return (
    <div className="container-x max-w-2xl py-10 sm:py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <Check size={34} strokeWidth={3} />
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Thank you — order placed!</h1>
        <p className="max-w-md text-sm text-muted">
          Order <b className="text-foreground">{number || "confirmed"}</b> is saved on this device. Follow it any time from{" "}
          <Link href="/track-order" className="font-semibold text-brand-600 hover:underline">My orders</Link> — no number to remember.
        </p>
      </div>
      {pay && <div className="mt-6"><MpesaPrompt info={pay} onPaid={() => setReload((n) => n + 1)} /></div>}
      <div className="mt-6">
        {order ? <OrderCard order={order} defaultOpen /> : <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg"><Link href="/track-order">View my orders</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/shop">Continue shopping</Link></Button>
      </div>
    </div>
  );
}

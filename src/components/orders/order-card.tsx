"use client";

import { Check, ChevronDown, CircleX, MapPin, MessageCircle, Package, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { useCatalog } from "@/context/catalog";
import type { PublicOrder } from "@/lib/order-public";
import { cn, formatPrice } from "@/lib/utils";

// The four milestones a shopper follows, and which order statuses map to each.
const stages = [
  { icon: Check, title: "Ordered", statuses: ["pending", "confirmed", "processing"] },
  { icon: Package, title: "Packed", statuses: ["packed"] },
  { icon: Truck, title: "On the way", statuses: ["shipped", "out-for-delivery"] },
  { icon: MapPin, title: "Delivered", statuses: ["delivered"] },
];

function stageIndex(status: string) {
  const i = stages.findIndex((s) => s.statuses.includes(status));
  return i === -1 ? 0 : i;
}

const ENDED = ["cancelled", "refunded", "returned"];

function niceDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(d).toLocaleDateString("en-KE", opts);
}

/** Friendly headline for where the order is right now (Amazon-style). */
function headline(o: PublicOrder) {
  const eta = new Date(o.date);
  eta.setDate(eta.getDate() + (/nairobi/i.test(o.city) ? 1 : 3));
  switch (o.status) {
    case "delivered": return { text: "Delivered", tone: "text-emerald-600 dark:text-emerald-400" };
    case "shipped":
    case "out-for-delivery": return { text: `Arriving ${niceDate(eta, { weekday: "long", day: "numeric", month: "short" })}`, tone: "text-emerald-600 dark:text-emerald-400" };
    case "cancelled": return { text: "Cancelled", tone: "text-rose-500" };
    case "refunded": return { text: "Refunded", tone: "text-rose-500" };
    case "returned": return { text: "Returned", tone: "text-rose-500" };
    case "packed": return { text: `Packed · arriving by ${niceDate(eta, { weekday: "short", day: "numeric", month: "short" })}`, tone: "text-brand-600" };
    default: return { text: `Order received · arriving by ${niceDate(eta, { weekday: "short", day: "numeric", month: "short" })}`, tone: "text-brand-600" };
  }
}

export function OrderCard({ order, defaultOpen = false }: { order: PublicOrder; defaultOpen?: boolean }) {
  const { productMap, settings } = useCatalog();
  const [open, setOpen] = useState(defaultOpen);
  const ended = ENDED.includes(order.status);
  const current = stageIndex(order.status);
  const h = headline(order);
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const wa = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi SIR VERT, I'd like an update on order ${order.number}`)}`
    : "/contact";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* header strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border bg-surface-2 px-4 py-2.5 text-xs text-muted">
        <span>Placed <b className="text-foreground">{niceDate(order.date, { day: "numeric", month: "short", year: "numeric" })}</b></span>
        <span>Total <b className="text-foreground">{formatPrice(order.total)}</b></span>
        <span className="font-semibold text-foreground">{order.number}</span>
      </div>

      <div className="p-4">
        <p className={cn("font-display text-base font-bold sm:text-lg", h.tone)}>{h.text}</p>
        <p className="text-xs text-muted">
          {count} item{count !== 1 && "s"} · {order.payment}{order.paymentStatus === "paid" ? " · Paid" : order.payment === "Cash on Delivery" ? " · Pay when it arrives" : ""}
        </p>

        {/* progress tracker */}
        {ended ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
            <CircleX size={18} /> This order was {order.status}. Chat with us if you have any questions.
          </div>
        ) : (
          <ol className="mt-5 grid grid-cols-4" aria-label="Delivery progress">
            {stages.map((s, i) => {
              const done = i <= current;
              return (
                <li key={s.title} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <span className={cn("absolute right-1/2 top-4 h-1 w-full -translate-y-1/2 rounded-full", i <= current ? "bg-emerald-500" : "bg-border")} aria-hidden />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid size-8 place-items-center rounded-full border-2 transition-colors",
                      done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-surface text-muted",
                      i === current && "ring-4 ring-emerald-500/20",
                    )}
                  >
                    <s.icon size={15} strokeWidth={2.5} />
                  </span>
                  <span className={cn("mt-1.5 text-[11px] font-semibold sm:text-xs", done ? "text-foreground" : "text-muted")}>{s.title}</span>
                </li>
              );
            })}
          </ol>
        )}

        {/* items */}
        <ul className="mt-5 flex flex-col gap-3">
          {order.items.slice(0, open ? undefined : 2).map((it) => {
            const p = productMap[it.slug];
            return (
              <li key={it.slug} className="flex items-center gap-3">
                {p ? (
                  <Link href={`/product/${p.slug}`} className="shrink-0">
                    <ProductImage product={p} sizes="56px" glow={false} className="size-14 rounded-lg border border-border" />
                  </Link>
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted"><PackageCheck size={20} /></span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                  <p className="text-xs text-muted">Qty {it.quantity} · {formatPrice(it.price)}</p>
                </div>
                {p && (
                  <Link href={`/product/${p.slug}`} className="hidden shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-2 sm:block">
                    Buy again
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {open && (
          <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="text-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Payment summary</p>
              <Row k="Items" v={formatPrice(order.subtotal)} />
              <Row k="Delivery" v={order.shipping ? formatPrice(order.shipping) : "Free"} />
              {order.discount > 0 && <Row k="Discount" v={`− ${formatPrice(order.discount)}`} />}
              <Row k="Total" v={formatPrice(order.total)} bold />
            </div>
            {order.timeline.length > 0 && (
              <div className="text-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Updates</p>
                <ul className="flex flex-col gap-1.5">
                  {[...order.timeline].reverse().slice(0, 6).map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", i === 0 ? "bg-emerald-500" : "bg-border")} />
                      <span className="flex-1">{t.label}</span>
                      <span className="shrink-0 text-xs text-muted">{niceDate(t.at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-xs font-semibold hover:bg-surface-2"
          >
            {open ? "Hide details" : order.items.length > 2 ? `View all ${order.items.length} items & details` : "Order details"}
            <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
          </button>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-xs font-bold text-white hover:opacity-90">
            <MessageCircle size={14} /> Ask about this order
          </a>
        </div>
      </div>
    </article>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <p className={cn("flex justify-between py-0.5", bold && "mt-1 border-t border-border pt-1.5 font-bold")}>
      <span className={bold ? "" : "text-muted"}>{k}</span>
      <span className="tabular-nums">{v}</span>
    </p>
  );
}

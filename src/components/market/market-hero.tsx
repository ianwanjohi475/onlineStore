"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryCharging, Cable, Camera, Check, ChevronRight, Headphones, Home, Monitor, MessageCircle,
  Rocket, Speaker, Sparkles, Truck, Watch, Zap, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { useCatalog } from "@/context/catalog";
import { discountPercent, formatPrice } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Headphones, Watch, BatteryCharging, Zap, Cable, Speaker, Home, Monitor, Camera, Sparkles, Rocket,
};

export function MarketHero() {
  const { productMap, categories, settings } = useCatalog();
  const now = Date.now();
  const slides = settings.heroSlides.filter(
    (s) =>
      productMap[s.slug] &&
      s.active !== false &&
      (!s.startDate || new Date(s.startDate).getTime() <= now) &&
      (!s.endDate || new Date(s.endDate).getTime() >= now),
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length === 0) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(i, slides.length - 1)];
  const product = productMap[slide.slug];
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const features = (product.features ?? []).slice(0, 4);
  const wa = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "/contact";

  // Biggest-discount product, shown on the Flash Sale promo card.
  const deal = Object.values(productMap)
    .filter((p) => p.compareAt && p.compareAt > p.price)
    .sort((a, b) => discountPercent(b.compareAt!, b.price) - discountPercent(a.compareAt!, a.price))[0];

  return (
    <section className="container-x pt-5">
      <div className="grid gap-4 lg:grid-cols-[230px_1fr] xl:grid-cols-[230px_1fr_270px]">
        {/* category sidebar */}
        <aside className="hidden overflow-hidden rounded-2xl border border-border bg-surface lg:block">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-bold">
            <Sparkles size={15} className="text-brand-500" /> Categories
          </div>
          <nav className="p-1.5">
            {categories.map((c) => {
              const Icon = icons[c.icon] ?? Sparkles;
              return (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-brand-500/10"
                >
                  <Icon size={17} className="text-muted transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                  <span className="flex-1 font-medium">{c.name}</span>
                  <ChevronRight size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* banner poster carousel */}
        <div
          className="relative overflow-hidden rounded-2xl border border-border"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative grid h-full min-h-[380px] grid-cols-1 sm:grid-cols-[1.15fr_1fr]"
              style={{ background: `linear-gradient(125deg, ${slide.from}, ${slide.to})` }}
            >
              {/* decorative glow */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 78% 42%, rgba(0,230,118,0.18), transparent 55%)" }} />

              {/* copy */}
              <div className="relative z-10 flex flex-col justify-center gap-3 p-7 text-white sm:p-8">
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white">
                    <Zap size={11} className="fill-brand-950" /> Now in stock
                  </span>
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-300">{slide.eyebrow}</span>
                </div>

                <h2 className="font-display text-2xl font-extrabold leading-[1.05] sm:text-3xl lg:text-[2.4rem]">
                  {slide.headline ?? slide.title}
                </h2>
                <p className="max-w-sm text-sm text-white/70">{slide.copy}</p>

                {features.length > 0 && (
                  <ul className="mt-1 grid max-w-md grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[0.82rem] text-white/85">
                        <Check size={14} className="shrink-0 text-brand-400" strokeWidth={3} /> {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-1 flex items-center gap-3">
                  <span className="font-display text-3xl font-extrabold">{formatPrice(product.price)}</span>
                  {product.compareAt && <span className="text-sm text-white/50 line-through">{formatPrice(product.compareAt)}</span>}
                  {off > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">-{off}%</span>}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2.5">
                  <Link
                    href={slide.buttonLink || `/product/${slide.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-brand-600"
                  >
                    {slide.buttonText || "Shop now"} <ChevronRight size={16} />
                  </Link>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </div>
                <p className="text-[0.68rem] font-medium uppercase tracking-wider text-white/45">Genuine product · 1-year warranty · SIR VERT ENTERPRISE</p>
              </div>

              {/* product spotlight */}
              <div className="relative hidden items-center justify-center p-6 sm:flex">
                <div className="relative aspect-square w-[86%] max-w-[300px]">
                  {off > 0 && (
                    <span className="absolute -left-1 top-2 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">-{off}%</span>
                  )}
                  <ProductImage product={product} priority sizes="320px" glow={false} className="absolute inset-0 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-8 flex gap-1.5">
            {slides.map((s, n) => (
              <button
                key={s.slug}
                onClick={() => setI(n)}
                aria-label={`Slide ${n + 1}`}
                className="h-1.5 rounded-full bg-white transition-all"
                style={{ width: n === i ? 26 : 8, opacity: n === i ? 1 : 0.4 }}
              />
            ))}
          </div>
        </div>

        {/* side promo cards */}
        <div className="hidden flex-col gap-4 xl:flex">
          <Link href="/flash-sales" className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-5 text-white">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Flash Sale</p>
              <p className="mt-1 font-display text-2xl font-bold leading-tight">Up to 40% off</p>
              {deal && <p className="mt-1 text-xs text-white/80">{deal.name} · {formatPrice(deal.price)}</p>}
            </div>
            {/* deal product image */}
            {deal && (
              <div className="pointer-events-none absolute bottom-3 right-3 size-24 overflow-hidden rounded-xl bg-white/95 shadow-lg ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
                <ProductImage product={deal} sizes="96px" glow={false} className="size-full" />
              </div>
            )}
            <span className="relative z-10 inline-flex w-fit items-center gap-1 text-sm font-semibold">Grab deals <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
            <div aria-hidden className="absolute -left-8 -top-8 size-28 rounded-full bg-white/20 blur-2xl" />
          </Link>
          <Link href="/services" className="group flex flex-1 flex-col justify-between rounded-2xl border border-border bg-surface p-5">
            <div>
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <Truck size={20} />
                <p className="text-sm font-bold">Networking services</p>
              </div>
              <p className="mt-1.5 text-xs text-muted">Fibre splicing, WiFi, router setup & PC repair.</p>
            </div>
            <span className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Book now <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

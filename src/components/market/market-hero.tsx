"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryCharging, Cable, Camera, ChevronRight, Headphones, Home, Monitor, Rocket, Speaker, Sparkles,
  Truck, Watch, Zap, type LucideIcon,
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
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(i, slides.length - 1)];
  const product = productMap[slide.slug];
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;

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

        {/* carousel */}
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
              className="grid h-full min-h-[300px] grid-cols-1 sm:grid-cols-2"
              style={{ background: `linear-gradient(120deg, ${slide.from}, ${slide.to})` }}
            >
              <div className="flex flex-col justify-center gap-3 p-8 text-brand-50">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <Zap size={12} className="fill-brand-400 text-brand-400" /> {slide.eyebrow}
                </span>
                <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{slide.title}</h2>
                <p className="max-w-xs text-sm text-brand-100/80">{slide.copy}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="font-display text-2xl font-bold">{formatPrice(product.price)}</span>
                  {off > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold">-{off}%</span>}
                </div>
                <Link href={slide.buttonLink || `/product/${slide.slug}`} className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-brand-950 transition-colors hover:bg-brand-400">
                  {slide.buttonText || "Shop now"} <ChevronRight size={16} />
                </Link>
              </div>
              <div className="relative hidden sm:block">
                <ProductImage product={product} priority sizes="400px" className="absolute inset-0" />
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Flash Sale</p>
              <p className="mt-1 font-display text-2xl font-bold leading-tight">Up to 40% off</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold">Grab deals <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
            <div aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-white/20 blur-2xl" />
          </Link>
          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Truck size={20} />
              <p className="text-sm font-bold">Free delivery</p>
            </div>
            <p className="mt-1 text-xs text-muted">On orders over KES 5,000 in Nairobi — next day.</p>
            <Link href="/shop" className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Start shopping <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

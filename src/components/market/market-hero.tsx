"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, LayoutGrid, Package, Truck, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useCatalog } from "@/context/catalog";
import { discountPercent, formatPrice } from "@/lib/utils";
import { PosterSlide } from "./poster-slide";

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
    const id = setTimeout(() => setI((n) => (n + 1) % slides.length), 5500);
    return () => clearTimeout(id);
  }, [paused, slides.length, i]);

  const next = () => setI((n) => (n + 1) % Math.max(slides.length, 1));
  const prev = () => setI((n) => (n - 1 + slides.length) % Math.max(slides.length, 1));

  if (slides.length === 0) return null;
  const slide = slides[Math.min(i, slides.length - 1)];
  const product = productMap[slide.slug];

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
            <LayoutGrid size={15} className="text-brand-500" /> Categories
          </div>
          <nav className="p-1.5">
            {categories.map((c) => {
              return (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5"
                >
                  <CategoryIcon slug={c.slug} className="size-5" />
                  <span className="flex-1 font-medium">{c.name}</span>
                  <ChevronRight size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* banner poster carousel */}
        <div
          className="group/poster relative h-[250px] overflow-hidden rounded-2xl shadow-sm sm:h-[360px] lg:h-auto lg:min-h-[400px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) next();
                else if (info.offset.x > 50) prev();
              }}
              className="absolute inset-0"
            >
              <Link href={slide.buttonLink || `/product/${slide.slug}`} draggable={false} aria-label={`${slide.title} — ${slide.buttonText || "Shop now"}`} className="block h-full">
                <PosterSlide slide={slide} product={product} priority={i === 0} />
              </Link>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous banner" className="absolute left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#111] opacity-0 shadow-md backdrop-blur transition-opacity group-hover/poster:opacity-100 sm:grid">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} aria-label="Next banner" className="absolute right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#111] opacity-0 shadow-md backdrop-blur transition-opacity group-hover/poster:opacity-100 sm:grid">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-7 right-4 z-10 flex gap-1.5 sm:bottom-10 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
                {slides.map((s, n) => (
                  <button
                    key={s.id}
                    onClick={() => setI(n)}
                    aria-label={`Banner ${n + 1}`}
                    className="h-1.5 rounded-full bg-[#111] transition-all"
                    style={{ width: n === i ? 22 : 7, opacity: n === i ? 0.9 : 0.3 }}
                  />
                ))}
              </div>
            </>
          )}
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

      {/* quick links under the banner on phones & tablets */}
      <div className="mt-3 grid grid-cols-4 gap-2 xl:hidden">
        {[
          { href: "/flash-sales", label: "Flash Sale", icon: Flame, tint: "bg-rose-50 text-rose-600 dark:bg-rose-500/10" },
          { href: "/track-order", label: "My Orders", icon: Package, tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/10" },
          { href: "/services", label: "Services", icon: Wrench, tint: "bg-sky-50 text-sky-600 dark:bg-sky-500/10" },
          { href: "/shipping", label: "Delivery", icon: Truck, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface py-2.5 text-[11px] font-semibold transition-colors hover:border-brand-500/40">
            <span className={`grid size-9 place-items-center rounded-full ${q.tint}`}><q.icon size={18} /></span>
            {q.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

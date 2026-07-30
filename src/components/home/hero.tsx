"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Star, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductArt } from "@/components/product/product-art";
import { productMap } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

const slides = [
  {
    slug: "watch-meta-ultra",
    eyebrow: "New flagship wearable",
    title: "Meta Ultra",
    highlight: "on your wrist",
    copy: "A flagship AMOLED smartwatch with on-wrist calling and a 14-day battery. Your health, beautifully in focus.",
    offer: "Save 25% this week",
  },
  {
    slug: "freepods-4-pro",
    eyebrow: "Adaptive noise cancellation",
    title: "FreePods 4 Pro",
    highlight: "pure silence",
    copy: "Titanium drivers and adaptive ANC that reads the room. 48 hours of playtime, zero distractions.",
    offer: "Bestseller · -28%",
  },
  {
    slug: "powercore-27000",
    eyebrow: "Power that keeps up",
    title: "PowerCore 27000",
    highlight: "charge anything",
    copy: "65W of USB-C power delivery in your pocket — enough to refuel a laptop and still keep your phone alive.",
    offer: "Flash deal · 20% off",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];
  const product = productMap[slide.slug];

  return (
    <section className="relative overflow-hidden">
      {/* aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-1/4 top-0 size-[46rem] animate-aurora rounded-full opacity-30 blur-[120px]"
          style={{ background: product.accent }}
        />
        <div className="absolute -right-1/4 bottom-0 size-[40rem] animate-aurora rounded-full bg-brand-600 opacity-20 blur-[120px] [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,transparent,var(--background)_70%)]" />
      </div>

      <div className="container-x grid min-h-[calc(100svh-6.25rem)] items-center gap-8 py-10 lg:grid-cols-2 lg:py-0">
        {/* copy */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
            >
              <span className="eyebrow">
                <Zap size={14} className="fill-brand-500" /> {slide.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
                {slide.title}
                <br />
                <span className="text-gradient">{slide.highlight}</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted">{slide.copy}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500/12 px-3.5 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                <Star size={14} className="fill-current" /> {slide.offer} · from {formatPrice(product.price)}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={`/product/${slide.slug}`}>
                Shop now <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/flash-sales">See all deals</Link>
            </Button>
          </div>

          {/* slide dots */}
          <div className="mt-8 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => setIndex(i)}
                aria-label={`Show ${s.title}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 32 : 10,
                  background: i === index ? "var(--color-brand-500)" : "var(--muted)",
                  opacity: i === index ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* mini trust */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Truck size={14} /> Free next-day delivery</span>
            <span className="inline-flex items-center gap-1.5"><Star size={14} className="fill-brand-500 text-brand-500" /> 4.8 from 180k+ reviews</span>
          </div>
        </div>

        {/* visual */}
        <div className="relative order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto aspect-square w-full max-w-lg"
            >
              <ProductArt category={product.category} accent={product.accent} className="size-full rounded-[2.5rem] border border-border" />

              {/* floating chips */}
              <motion.div
                className="glass absolute -left-2 top-10 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card sm:left-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="grid size-8 place-items-center rounded-full bg-brand-500 text-brand-950"><Zap size={15} /></span>
                <div className="text-xs">
                  <p className="font-bold">Fast charge</p>
                  <p className="text-muted">0→50% in 15 min</p>
                </div>
              </motion.div>

              <motion.div
                className="glass absolute bottom-10 right-0 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card sm:right-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex -space-x-2">
                  {["#00E676", "#34F5C5", "#7CFF6B"].map((c) => (
                    <span key={c} className="size-6 rounded-full border-2 border-surface" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-xs">
                  <p className="font-bold">12,400+ sold</p>
                  <p className="text-muted">this month</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

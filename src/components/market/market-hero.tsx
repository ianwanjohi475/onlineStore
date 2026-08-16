"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalog } from "@/context/catalog";

// Designed banner posters (public/banners/<slug>.jpg + <slug>-m.jpg for mobile).
const BANNER_SLUGS = new Set(["watch-nova-am", "powerbank-q21", "boompop-pro", "services"]);

export function MarketHero() {
  const { settings } = useCatalog();
  const now = Date.now();
  const slides = settings.heroSlides.filter(
    (s) =>
      BANNER_SLUGS.has(s.slug) &&
      s.active !== false &&
      (!s.startDate || new Date(s.startDate).getTime() <= now) &&
      (!s.endDate || new Date(s.endDate).getTime() >= now),
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length === 0) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(i, slides.length - 1)];
  const href = slide.buttonLink || `/product/${slide.slug}`;

  return (
    <section className="container-x pt-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
        {/* full-width banner carousel */}
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-[#0b1220]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div key={slide.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Link href={href} aria-label={slide.title} className="block">
                {/* desktop / tablet poster (16:6) */}
                <Image
                  src={`/banners/${slide.slug}.jpg`}
                  alt={slide.title}
                  width={1600}
                  height={600}
                  priority
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="hidden aspect-[8/3] w-full object-cover sm:block"
                />
                {/* mobile poster (square) */}
                <Image
                  src={`/banners/${slide.slug}-m.jpg`}
                  alt={slide.title}
                  width={1080}
                  height={1080}
                  priority
                  sizes="100vw"
                  className="aspect-square w-full object-cover sm:hidden"
                />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-6 flex gap-1.5">
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
        <div className="hidden flex-col gap-4 lg:flex">
          <Link href="/flash-sales" className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-5 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Flash Sale</p>
              <p className="mt-1 font-display text-2xl font-bold leading-tight">Up to 40% off</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold">Grab deals <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
            <div aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-white/20 blur-2xl" />
          </Link>
          <Link href="/services" className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e2a3a] to-[#0b1a2e] p-5 text-white">
            <div className="flex items-center gap-2 text-brand-400">
              <Sparkles size={18} />
              <p className="text-sm font-bold">Networking services</p>
            </div>
            <p className="mt-1 text-xs text-white/70">Fibre splicing, WiFi, router setup & PC repair.</p>
            <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-300">Book now <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}

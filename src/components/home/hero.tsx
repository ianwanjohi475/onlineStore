"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { productMap } from "@/lib/data/products";
import { discountPercent, formatPrice } from "@/lib/utils";

const featured = ["watch-meta-ultra", "freepods-4-pro", "soundgo-boom", "powercore-27000"];
const avatars = ["/people/a1.jpg", "/people/a2.jpg", "/people/a3.jpg", "/people/a4.jpg"];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const product = productMap[featured[index]];
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;

  return (
    <section className="relative overflow-hidden">
      {/* backdrop: soft light + faint grid, no neon blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_-10%,var(--color-brand-500)14,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.4] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
      </div>

      <div className="container-x grid items-center gap-10 py-14 lg:min-h-[calc(100svh-6.25rem)] lg:grid-cols-2 lg:gap-6 lg:py-0">
        {/* copy */}
        <div className="order-2 max-w-xl lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-sm">
            <Sparkles size={13} className="text-brand-500" />
            New season drop
            <span className="text-muted">· free delivery</span>
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            Smart tech,
            <br />
            <span className="text-gradient">powered for life.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-muted">
            Genuine Oraimo audio, wearables and power — engineered to keep up with your day and
            delivered fast across Kenya, warranty included.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/shop">Shop the range <ArrowRight size={18} /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/flash-sales">Today&apos;s deals</Link>
            </Button>
          </div>

          {/* trust row with real avatars */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.map((src) => (
                  <span key={src} className="relative size-9 overflow-hidden rounded-full border-2 border-background">
                    <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 font-semibold">
                  4.8 <Star size={13} className="fill-brand-500 text-brand-500" />
                </div>
                <p className="text-xs text-muted">180k+ happy customers</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-brand-500" /> Next-day delivery</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-500" /> 12-mo warranty</span>
            </div>
          </div>
        </div>

        {/* product stage */}
        <div className="order-1 lg:order-2">
          <div
            className="relative mx-auto w-full max-w-xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-b from-surface to-surface-2 shadow-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <ProductImage product={product} priority className="size-full" />
                </motion.div>
              </AnimatePresence>

              {/* price tag chip */}
              <div className="glass absolute left-5 top-5 rounded-2xl px-4 py-2.5 shadow-card">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{product.category.replace("-", " ")}</p>
                <p className="font-display text-lg font-bold">{formatPrice(product.price)}</p>
              </div>
              {off > 0 && (
                <div className="absolute right-5 top-5 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  Save {off}%
                </div>
              )}

              <motion.div
                className="glass absolute bottom-5 right-5 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star size={15} className="fill-brand-500 text-brand-500" />
                <span className="text-xs font-semibold">{product.rating} · {product.reviewCount.toLocaleString()} reviews</span>
              </motion.div>

              <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={`View ${product.name}`} />
            </div>

            {/* thumbnail switcher */}
            <div className="mt-4 flex justify-center gap-3">
              {featured.map((slug, i) => (
                <button
                  key={slug}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${productMap[slug].name}`}
                  className={`relative size-16 overflow-hidden rounded-2xl border-2 transition-all ${
                    i === index ? "border-brand-500 shadow-glow" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductImage product={productMap[slug]} glow={false} className="size-full" sizes="64px" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

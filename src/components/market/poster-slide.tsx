import { Check, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import type { HeroSlide, Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

/**
 * Marketplace promo poster (Kilimall / Jumia style, polished): pastel
 * background with a spotlight behind the product, scrolling ribbons, a bold
 * sticker headline, a caption strip, key features, a savings sticker and a
 * clear call to action. Pure HTML/CSS — sharp on every screen and editable
 * live from Admin → Banners (colours, text, product, price).
 *
 *  slide.from → poster background · slide.to → ribbon / accent colour
 */
export function PosterSlide({
  slide,
  product,
  priority = false,
  compact = false,
}: {
  slide: HeroSlide;
  product: Product;
  priority?: boolean;
  /** smaller type for the admin preview */
  compact?: boolean;
}) {
  if (slide.bannerImage) {
    // The admin's own finished banner design: show it whole on phones (padded
    // with the banner colour), filling the frame on bigger screens.
    return (
      <div className="relative h-full w-full overflow-hidden" style={{ background: slide.from }}>
        <Image
          src={slide.bannerImage}
          alt={slide.title || product.name}
          fill
          priority={priority}
          unoptimized={!optimizable(slide.bannerImage)}
          sizes={compact ? "480px" : "(max-width: 1024px) 100vw, 900px"}
          className="object-contain transition-transform duration-500 group-hover/poster:scale-[1.02] sm:object-cover"
        />
      </div>
    );
  }
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const save = off > 0 && product.compareAt ? product.compareAt - product.price : 0;
  const img = slide.image || product.image;
  const cutout = !!img && /\.png($|\?)/i.test(img);
  const top = `${slide.eyebrow || "SIR VERT DEALS"}`.toUpperCase();
  const ribbonTop = Array.from({ length: 8 }, () => `◂◂◂ ${top} ◂◂`);
  const ribbonBottom = Array.from({ length: 6 }, () => "Genuine products ✦ 12-month warranty ✦ Fast delivery across Kenya ✦ Pay on delivery ✦");
  const features = (product.features ?? []).slice(0, 3);
  const pill = off > 0 ? `-${off}% OFF` : product.badges.includes("new") ? "NEW ARRIVAL" : product.badges.includes("bestseller") ? "BESTSELLER" : "HOT DEAL";
  const watermark = (slide.eyebrow || product.name).split(/[·\s]/)[0].toUpperCase();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ background: slide.from }}>
      <Ribbon items={ribbonTop} color={slide.to} compact={compact} />

      <div className="relative grid min-h-0 flex-1 grid-cols-[1.1fr_1fr] items-center">
        {/* background: giant faint word, halftone dots, soft light, sparkles */}
        {!compact && (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 right-0 select-none font-display text-[4rem] font-black leading-none tracking-tighter opacity-[0.06] sm:text-[7rem]"
            style={{ color: slide.to }}
          >
            {watermark}
          </span>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-[70%] opacity-30"
          style={{
            backgroundImage: `radial-gradient(${slide.to} 1.4px, transparent 1.6px)`,
            backgroundSize: "12px 12px",
            maskImage: "radial-gradient(circle at 70% 30%, black, transparent 65%)",
            WebkitMaskImage: "radial-gradient(circle at 70% 30%, black, transparent 65%)",
          }}
        />
        <Sparkle className="left-[4%] top-[9%] size-4 sm:size-6" color={slide.to} />
        <Sparkle className="left-[11%] top-[4%] size-2.5 sm:size-3.5" color={slide.to} />
        <Sparkle className="bottom-[10%] right-[46%] size-3 sm:size-4" color={slide.to} />

        {/* copy */}
        <div className={cn("relative z-10 flex flex-col items-start", compact ? "gap-1.5 p-3" : "gap-1.5 px-4 py-3 sm:gap-2.5 sm:p-8 lg:pl-10")}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn("rounded-full font-extrabold uppercase tracking-wide text-white shadow-sm", compact ? "px-2 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs")}
              style={{ background: off > 0 ? "#e11d48" : slide.to }}
            >
              {pill}
            </span>
            {!compact && (
              <span className="hidden items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-[#111] backdrop-blur sm:inline-flex">
                <ShieldCheck size={12} /> Official store
              </span>
            )}
          </div>

          <h2
            className={cn(
              "max-w-[16ch] font-display font-black leading-[0.95] tracking-tight text-[#ffd60a] [text-wrap:balance]",
              compact ? "text-xl" : "text-[1.4rem] sm:text-[2.5rem] xl:text-[2.8rem]",
            )}
            style={{
              lineHeight: 1,
              textShadow:
                "0 1.5px 0 #111, 1.5px 0 0 #111, -1.5px 0 0 #111, 0 -1.5px 0 #111, 1.5px 1.5px 0 #111, -1.5px 1.5px 0 #111, 1.5px -1.5px 0 #111, -1.5px -1.5px 0 #111, 3px 4px 0 #111",
            }}
          >
            {slide.title}
          </h2>

          <p className={cn("-rotate-1 bg-[#111] font-bold text-white shadow-md", compact ? "px-2 py-1 text-[9px]" : "line-clamp-2 px-2 py-1 text-[10px] leading-tight sm:px-4 sm:py-2 sm:text-[15px]")}>
            {slide.headline || slide.copy}
          </p>

          {!compact && features.length > 0 && (
            <ul className="hidden flex-wrap gap-1.5 xl:flex">
              {features.slice(0, 2).map((f) => (
                <li key={f} className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-[#111] backdrop-blur">
                  <Check size={12} strokeWidth={3} style={{ color: slide.to }} /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className={cn("items-end gap-3", compact ? "flex" : "hidden sm:flex")}>
            <div className="leading-none">
              {product.compareAt && product.compareAt > product.price && (
                <span className={cn("block text-[#111]/55 line-through", compact ? "text-[9px]" : "text-sm")}>{formatPrice(product.compareAt)}</span>
              )}
              <span className={cn("font-display font-black text-[#111]", compact ? "text-base" : "text-3xl lg:text-4xl")}>{formatPrice(product.price)}</span>
            </div>
            {save > 0 && !compact && (
              <span className="mb-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-extrabold text-white shadow">Save {formatPrice(save)}</span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#111] font-bold text-white shadow-lg ring-2 ring-white/40 transition-transform group-hover/poster:-translate-y-0.5",
                compact ? "px-3 py-1 text-[9px]" : "px-3.5 py-1.5 text-[11px] sm:px-6 sm:py-3 sm:text-sm",
              )}
            >
              {slide.buttonText || "Shop now"} <span aria-hidden className="transition-transform group-hover/poster:translate-x-1">→</span>
            </span>
            {!compact && (
              <span className="hidden items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#111]/70 2xl:inline-flex">
                <Truck size={14} /> Free delivery over 5K
              </span>
            )}
          </div>
        </div>

        {/* product on a spotlight podium + swing price tag */}
        <div className="relative flex h-full items-center justify-center p-2 pr-3 sm:p-6">
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[88%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[2px]" />
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[70%] max-w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${slide.to}33, transparent 70%)` }} />
          <div aria-hidden className="absolute bottom-[9%] left-1/2 h-4 w-[55%] max-w-[220px] -translate-x-1/2 rounded-[50%] bg-black/25 blur-md" />
          <div className={cn("relative flex w-[92%] max-w-[330px] justify-center", !compact && "animate-float")}>
          <div
            className={cn(
              "relative aspect-square w-full transition-transform duration-500 group-hover/poster:scale-[1.04]",
              !cutout && "overflow-hidden rounded-2xl bg-white shadow-xl ring-4 ring-white/80 -rotate-2",
            )}
          >
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 45vw, 340px"
                unoptimized={!optimizable(img)}
                className={cn("object-contain", cutout ? "drop-shadow-[0_18px_22px_rgba(0,0,0,0.3)]" : "p-1")}
              />
            ) : null}
          </div>
          </div>
          <span
            className={cn(
              "absolute right-[3%] top-[5%] z-10 origin-top-left rotate-[8deg] rounded-md border-2 border-[#111] bg-[#d9f99d] font-display font-black text-[#111] shadow-md",
              compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-lg",
            )}
          >
            <span aria-hidden className="absolute -left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full border border-[#111] bg-white sm:size-2" />
            {formatPrice(product.price)}
          </span>
          {off > 0 && (
            <span
              className={cn(
                "absolute bottom-[8%] right-[4%] z-10 grid -rotate-12 place-items-center rounded-full bg-rose-600 text-center font-display font-black leading-none text-white shadow-lg ring-2 ring-white",
                compact ? "size-8 text-[8px]" : "size-12 text-[11px] sm:size-16 sm:text-sm",
              )}
            >
              <span>-{off}%<br /><span className="text-[0.7em] font-bold">OFF</span></span>
            </span>
          )}
        </div>
      </div>

      <Ribbon items={ribbonBottom} color={slide.to} compact={compact} reverse />
    </div>
  );
}

/** next/image can only resize our own files and Vercel Blob; other links load as-is. */
function optimizable(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
}

function Ribbon({ items, color, compact, reverse }: { items: string[]; color: string; compact: boolean; reverse?: boolean }) {
  return (
    <div className="relative shrink-0 overflow-hidden text-white" style={{ background: color }}>
      <div
        className={cn(
          "flex w-max animate-marquee whitespace-nowrap font-extrabold uppercase tracking-wider",
          compact ? "py-0.5 text-[7px]" : "py-1 text-[9px] sm:py-1.5 sm:text-xs",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i} className="px-4">{t}</span>
        ))}
      </div>
    </div>
  );
}

function Sparkle({ className, color }: { className?: string; color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("pointer-events-none absolute", className)} fill={color}>
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12C11.4 17.8 6.2 12.6 0 12 6.2 11.4 11.4 6.2 12 0Z" />
    </svg>
  );
}

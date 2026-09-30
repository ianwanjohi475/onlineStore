import Image from "next/image";
import type { HeroSlide, Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

/**
 * Marketplace-style promo poster (Kilimall / Jumia feel): pastel background,
 * scrolling ribbons top and bottom, a bold sticker headline, a black caption
 * box and the product with a swing price tag. Built in HTML/CSS so it stays
 * sharp on every screen and updates live from the admin (colours, text,
 * product, price).
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
  const off = product.compareAt ? discountPercent(product.compareAt, product.price) : 0;
  const img = product.image;
  const cutout = !!img && /\.png($|\?)/i.test(img);
  const top = `${slide.eyebrow || "SIR VERT DEALS"}`.toUpperCase();
  const ribbonTop = Array.from({ length: 8 }, () => `◂◂◂ ${top} ◂◂`);
  const ribbonBottom = Array.from({ length: 6 }, () => "Genuine products ✦ 12-month warranty ✦ Fast delivery across Kenya ✦ Pay on delivery ✦");

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ background: slide.from }}>
      {/* top ribbon */}
      <Ribbon items={ribbonTop} color={slide.to} compact={compact} />

      {/* body */}
      <div className="relative grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] items-center">
        {/* decoration: halftone dots + sparkles */}
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
        <Sparkle className="left-[4%] top-[10%] size-4 sm:size-6" color={slide.to} />
        <Sparkle className="left-[11%] top-[4%] size-2.5 sm:size-3.5" color={slide.to} />
        <Sparkle className="bottom-[8%] right-[44%] size-3 sm:size-4" color={slide.to} />

        {/* copy */}
        <div className={cn("relative z-10 flex flex-col items-start", compact ? "gap-1.5 p-3" : "gap-1.5 px-4 py-3 sm:gap-3 sm:p-8 lg:pl-10")}>
          <span
            className={cn("rounded-full font-extrabold uppercase tracking-wide text-white", compact ? "px-2 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs")}
            style={{ background: slide.to }}
          >
            {off > 0 ? `Save ${off}%` : "Now in stock"}
          </span>
          <h2
            className={cn(
              "font-display font-black leading-[0.95] tracking-tight text-[#ffd60a]",
              compact ? "text-xl" : "text-[1.45rem] sm:text-5xl lg:text-[3.4rem]",
            )}
            style={{
              textShadow:
                "0 1.5px 0 #111, 1.5px 0 0 #111, -1.5px 0 0 #111, 0 -1.5px 0 #111, 1.5px 1.5px 0 #111, -1.5px 1.5px 0 #111, 1.5px -1.5px 0 #111, -1.5px -1.5px 0 #111, 3px 4px 0 #111",
            }}
          >
            {slide.title}
          </h2>
          <p className={cn("bg-[#111] font-bold text-white", compact ? "px-2 py-1 text-[9px]" : "line-clamp-2 px-2 py-1 text-[10px] leading-tight sm:px-4 sm:py-2 sm:text-base")}>
            {slide.headline || slide.copy}
          </p>
          <div className={cn("items-baseline gap-2", compact ? "flex" : "hidden sm:flex")}>
            <span className={cn("font-display font-black text-[#111]", compact ? "text-base" : "text-lg sm:text-3xl")}>{formatPrice(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className={cn("text-[#111]/55 line-through", compact ? "text-[9px]" : "text-[10px] sm:text-sm")}>{formatPrice(product.compareAt)}</span>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full bg-[#111] font-bold text-white shadow-lg transition-transform group-hover/poster:-translate-y-0.5",
              compact ? "px-3 py-1 text-[9px]" : "px-3.5 py-1.5 text-[11px] sm:px-6 sm:py-2.5 sm:text-sm",
            )}
          >
            {slide.buttonText || "Shop now"} →
          </span>
        </div>

        {/* product + price tag */}
        <div className="relative flex h-full items-center justify-center p-2 pr-3 sm:p-6">
          <div
            className={cn(
              "relative aspect-square w-full max-w-[300px] transition-transform duration-500 group-hover/poster:scale-[1.03]",
              !cutout && "overflow-hidden rounded-2xl bg-white shadow-xl ring-4 ring-white/70 -rotate-2",
            )}
          >
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 45vw, 320px"
                className={cn("object-contain", cutout ? "drop-shadow-[0_18px_22px_rgba(0,0,0,0.3)]" : "p-1")}
              />
            ) : null}
          </div>
          {/* swing price tag */}
          <span
            className={cn(
              "absolute right-[4%] top-[6%] z-10 origin-top-left rotate-[8deg] rounded-md border-2 border-[#111] bg-[#d9f99d] font-display font-black text-[#111] shadow-md",
              compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-lg",
            )}
          >
            <span aria-hidden className="absolute -left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full border border-[#111] bg-white sm:size-2" />
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* bottom ribbon */}
      <Ribbon items={ribbonBottom} color={slide.to} compact={compact} reverse />
    </div>
  );
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

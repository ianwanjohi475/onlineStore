"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { productMedia, type MediaItem } from "@/lib/media";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Product gallery: every photo plus an optional video. Thumbnails, arrows,
 * swipe on phones, keyboard arrows, and cursor-following zoom on photos
 * (desktop only). Videos play inline (YouTube/Vimeo embed or a video file).
 */
export function ProductGallery({ product }: { product: Product }) {
  const media = productMedia(product);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const on = () => setCanHover(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // new product → back to the first photo
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [product.slug]);

  const count = media.length;
  const go = (i: number) => {
    if (count === 0) return;
    setIndex((i + count) % count);
    setPlaying(false);
    setZoom(false);
  };
  const current: MediaItem | undefined = media[Math.min(index, count - 1)];

  const onMove = (e: React.MouseEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={stageRef}
        tabIndex={count > 1 ? 0 : -1}
        aria-roledescription="carousel"
        aria-label={`${product.name} photos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
        onMouseEnter={() => canHover && current?.type === "image" && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={canHover && current?.type === "image" ? onMove : undefined}
        className={cn(
          "group relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-white outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-[#15181d]",
          canHover && current?.type === "image" && "cursor-zoom-in",
        )}
      >
        {!current ? (
          <div className="size-full bg-surface-2" role="img" aria-label={`${product.name} — photo coming soon`} />
        ) : current.type === "image" ? (
          <div className="size-full transition-transform duration-200 ease-out" style={{ transformOrigin: origin, transform: zoom ? "scale(1.8)" : "scale(1)" }}>
            <MediaImage src={current.src} alt={`${product.name} — photo ${index + 1}`} priority={index === 0} sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        ) : playing ? (
          current.kind === "file" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={current.embed} controls autoPlay playsInline className="size-full bg-black object-contain" />
          ) : (
            <iframe
              src={current.embed}
              title={`${product.name} video`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="size-full border-0 bg-black"
            />
          )
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="relative size-full bg-[#111]" aria-label="Play video">
            {current.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.poster} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="size-full object-cover opacity-80" />
            ) : media[0]?.type === "image" ? (
              <div className="size-full opacity-40"><MediaImage src={media[0].src} alt="" sizes="50vw" /></div>
            ) : null}
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-white/95 text-[#111] shadow-xl transition-transform group-hover:scale-110">
                <Play size={28} className="ml-1 fill-current" />
              </span>
            </span>
          </button>
        )}

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous" className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111] opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:grid">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next" className="absolute right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111] opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:grid">
              <ChevronRight size={20} />
            </button>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
              {index + 1} / {count}
            </span>
          </>
        )}
        {canHover && current?.type === "image" && !zoom && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-sm">Hover to zoom</span>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Choose photo or video">
          {media.map((m, i) => (
            <button
              key={`${m.type}-${m.src}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={m.type === "video" ? "Product video" : `Photo ${i + 1}`}
              onClick={() => go(i)}
              onMouseEnter={() => canHover && m.type === "image" && go(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors sm:size-20 dark:bg-[#15181d]",
                i === index ? "border-brand-500" : "border-border hover:border-brand-300",
              )}
            >
              {m.type === "image" ? (
                <MediaImage src={m.src} alt="" sizes="80px" />
              ) : (
                <span className="grid size-full place-items-center bg-[#111] text-white">
                  {m.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.poster} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="absolute inset-0 size-full object-cover opacity-60" />
                  )}
                  <span className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase">
                    <Play size={18} className="fill-current" /> Video
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaImage({ src, alt, sizes, priority = false }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const cls = cn("object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0");
  return (
    <div className="relative size-full">
      {src.startsWith("/") || src.includes(".public.blob.vercel-storage.com/") ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onLoad={() => setLoaded(true)} className={cls} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)} className={cn("absolute inset-0 size-full", cls)} />
      )}
    </div>
  );
}

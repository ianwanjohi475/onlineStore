"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

/**
 * Product image with cursor-following zoom on devices that can hover.
 * Shows the real photo only — no fake "angle" thumbnails generated from
 * renders, which didn't match the actual product photo.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [canHover, setCanHover] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const stageRef = useRef<HTMLDivElement>(null);

  // Zoom only where a real pointer can hover (not phones/tablets).
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const on = () => setCanHover(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={stageRef}
      onMouseEnter={() => canHover && setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={canHover ? onMove : undefined}
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-white",
        canHover && "cursor-zoom-in",
      )}
    >
      <div
        className="size-full transition-transform duration-200 ease-out"
        style={{ transformOrigin: origin, transform: zoom ? "scale(1.8)" : "scale(1)" }}
      >
        <ProductImage product={product} priority sizes="(max-width: 1024px) 100vw, 50vw" className="size-full" />
      </div>
      {canHover && !zoom && (
        <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
          Hover to zoom
        </span>
      )}
    </div>
  );
}

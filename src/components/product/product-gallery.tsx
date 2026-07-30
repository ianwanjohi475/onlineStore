"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductArt } from "./product-art";

/** Gallery with thumbnail selection and hover-zoom (pan-follows-cursor). */
export function ProductGallery({ product }: { product: Product }) {
  const angles = product.colors.length >= 3 ? product.colors.slice(0, 4) : [product.accent, ...product.colors];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const stageRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const accent = active === 0 ? product.accent : angles[active] ?? product.accent;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {angles.map((c, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`View ${i + 1}`}
            className={cn(
              "size-16 overflow-hidden rounded-2xl border transition-all",
              active === i ? "border-brand-500 ring-2 ring-brand-500/30" : "border-border hover:border-brand-500/50",
            )}
          >
            <ProductArt category={product.category} accent={i === 0 ? product.accent : c} className="size-full" glow={false} />
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[2rem] border border-border"
      >
        <ProductArt
          category={product.category}
          accent={accent}
          className={cn("size-full transition-transform duration-200", zoom && "scale-[1.7]")}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-200"
          style={{ transformOrigin: origin, transform: zoom ? "scale(1.7)" : "scale(1)" }}
        />
        <span className="absolute bottom-4 left-4 rounded-full glass px-3 py-1 text-xs font-medium text-muted">
          Hover to zoom
        </span>
      </div>
    </div>
  );
}

"use client";

import { ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/ui/countdown";
import { CompactProductCard } from "@/components/product/compact-product-card";
import type { Product } from "@/lib/types";

export function FlashRail({ products }: { products: Product[] }) {
  const target = Date.now() + 8 * 3600 * 1000;
  if (products.length === 0) return null;

  return (
    <section className="container-x py-4">
      <div className="overflow-hidden rounded-2xl border border-rose-500/30 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-500/10 to-transparent px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-rose-500 text-white">
              <Flame size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold leading-tight">Flash Sales</h2>
              <p className="text-xs text-muted">Lowest prices — while stocks last</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-muted sm:inline">Ends in</span>
              <Countdown target={target} compact />
            </div>
            <Link href="/flash-sales" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500 hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* horizontal scroll rail */}
        <div className="flex gap-3 overflow-x-auto p-4 [scrollbar-width:thin]">
          {products.map((p) => (
            <div key={p.slug} className="w-[46%] shrink-0 sm:w-[30%] lg:w-[19%]">
              <CompactProductCard product={p} showSold />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

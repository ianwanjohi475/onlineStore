"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data/categories";
import type { CategorySlug, Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

type Sort = "popular" | "price-asc" | "price-desc" | "rating" | "new";

const sorts: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "new", label: "Newest" },
];

export function ShopBrowser({
  products,
  initialCategory,
  initialSort = "popular",
}: {
  products: Product[];
  initialCategory?: CategorySlug;
  initialSort?: Sort;
}) {
  const [active, setActive] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [sort, setSort] = useState<Sort>(initialSort);
  const [maxPrice, setMaxPrice] = useState(12000);
  const [onlySale, setOnlySale] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (active !== "all") list = list.filter((p) => p.category === active);
    if (onlySale) list = list.filter((p) => p.compareAt);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "new": list = [...list].sort((a, b) => Number(b.badges.includes("new")) - Number(a.badges.includes("new"))); break;
      default: list = [...list].sort((a, b) => (b.soldPercent ?? 0) - (a.soldPercent ?? 0));
    }
    return list;
  }, [products, active, sort, maxPrice, onlySale, inStockOnly]);

  const Filters = (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="flex flex-col gap-1">
          {(["all", ...categories.map((c) => c.slug)] as const).map((slug) => {
            const label = slug === "all" ? "All products" : categories.find((c) => c.slug === slug)!.name;
            return (
              <button
                key={slug}
                onClick={() => setActive(slug)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active === slug ? "bg-brand-500/12 font-semibold text-brand-700 dark:text-brand-300" : "text-muted hover:bg-surface-2",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Max price</h3>
        <input
          type="range"
          min={800}
          max={12000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <p className="mt-1 text-sm text-muted">Up to {formatPrice(maxPrice)}</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} className="size-4 accent-brand-500" />
          On sale only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="size-4 accent-brand-500" />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <div className="container-x grid gap-8 py-12 lg:grid-cols-[16rem_1fr]">
      {/* desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">{Filters}</div>
      </aside>

      <div>
        {/* toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <b className="text-foreground">{filtered.length}</b> product{filtered.length !== 1 && "s"}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={15} /> Filters
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card-surface flex flex-col items-center gap-3 p-14 text-center">
            <p className="font-semibold">No products match your filters</p>
            <p className="text-sm text-muted">Try widening the price range or clearing a filter.</p>
            <Button variant="outline" onClick={() => { setActive("all"); setMaxPrice(12000); setOnlySale(false); setInStockOnly(false); }}>
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(85vw,20rem)] overflow-y-auto bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Filters</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
                <X size={18} />
              </button>
            </div>
            {Filters}
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>Show {filtered.length} results</Button>
          </div>
        </div>
      )}
    </div>
  );
}

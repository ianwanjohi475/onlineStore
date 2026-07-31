"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Rows3, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
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
  { value: "new", label: "Newest first" },
];
const ratingOptions = [0, 4, 4.5];
const PER_PAGE = 9;
const PRICE_MAX = 13000;

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
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [onlySale, setOnlySale] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [cols, setCols] = useState<3 | 4>(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PER_PAGE);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    for (const c of categories) map[c.slug] = products.filter((p) => p.category === c.slug).length;
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice && p.rating >= minRating);
    if (active !== "all") list = list.filter((p) => p.category === active);
    if (onlySale) list = list.filter((p) => p.compareAt);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q));
    }
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      new: (a, b) => Number(b.badges.includes("new")) - Number(a.badges.includes("new")),
      popular: (a, b) => (b.soldPercent ?? 0) - (a.soldPercent ?? 0),
    };
    return [...list].sort(by[sort]);
  }, [products, active, sort, maxPrice, minRating, onlySale, inStockOnly, query]);

  // brief loading pulse on any change — smooths reflow and reads as intentional
  useEffect(() => {
    setLoading(true);
    setVisible(PER_PAGE);
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, [active, sort, maxPrice, minRating, onlySale, inStockOnly, query]);

  const filtersActive =
    active !== "all" || maxPrice < PRICE_MAX || minRating > 0 || onlySale || inStockOnly || !!query.trim();

  const reset = () => {
    setActive("all"); setMaxPrice(PRICE_MAX); setMinRating(0); setOnlySale(false);
    setInStockOnly(false); setQuery("");
  };

  const shown = filtered.slice(0, visible);

  const Filters = (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="mb-3 text-sm font-bold">Category</h3>
        <div className="flex flex-col gap-0.5">
          {(["all", ...categories.filter((c) => c.slug !== "new-arrivals").map((c) => c.slug)] as const).map((slug) => {
            const label = slug === "all" ? "All products" : categories.find((c) => c.slug === slug)!.name;
            return (
              <button
                key={slug}
                onClick={() => setActive(slug)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active === slug ? "bg-brand-500/12 font-semibold text-brand-700 dark:text-brand-300" : "text-muted hover:bg-surface-2",
                )}
              >
                {label}
                <span className="text-xs tabular-nums opacity-60">{counts[slug] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold">Max price</h3>
        <input
          type="range" min={800} max={PRICE_MAX} step={100} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>{formatPrice(800)}</span>
          <span className="font-semibold text-foreground">{formatPrice(maxPrice)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold">Rating</h3>
        <div className="flex flex-col gap-0.5">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                minRating === r ? "bg-brand-500/12 font-semibold" : "text-muted hover:bg-surface-2",
              )}
            >
              {r === 0 ? "Any rating" : (
                <><Star size={13} className="fill-brand-500 text-brand-500" /> {r.toFixed(1)} &amp; up</>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} className="size-4 accent-brand-500" />
          On sale only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="size-4 accent-brand-500" />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[15rem_1fr]">
      {/* desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-display text-lg font-bold">Filters</span>
            {filtersActive && (
              <button onClick={reset} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Clear all
              </button>
            )}
          </div>
          {Filters}
        </div>
      </aside>

      <div>
        {/* toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this range…"
              className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm outline-none transition-colors focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={15} /> Filters
            </Button>
            <div className="hidden items-center rounded-full border border-border p-0.5 sm:flex">
              <button onClick={() => setCols(3)} aria-label="Comfortable grid" className={cn("grid size-8 place-items-center rounded-full", cols === 3 ? "bg-surface-2 text-foreground" : "text-muted")}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setCols(4)} aria-label="Compact grid" className={cn("grid size-8 place-items-center rounded-full", cols === 4 ? "bg-surface-2 text-foreground" : "text-muted")}>
                <Rows3 size={15} />
              </button>
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 appearance-none rounded-full border border-border bg-surface pl-4 pr-9 text-sm font-medium outline-none focus:border-brand-500"
              >
                {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">▾</span>
            </div>
          </div>
        </div>

        {/* active filter chips */}
        {filtersActive && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {active !== "all" && (
              <Chip onClear={() => setActive("all")}>{categories.find((c) => c.slug === active)?.name}</Chip>
            )}
            {query.trim() && <Chip onClear={() => setQuery("")}>&ldquo;{query.trim()}&rdquo;</Chip>}
            {minRating > 0 && <Chip onClear={() => setMinRating(0)}>{minRating}★ &amp; up</Chip>}
            {maxPrice < PRICE_MAX && <Chip onClear={() => setMaxPrice(PRICE_MAX)}>Under {formatPrice(maxPrice)}</Chip>}
            {onlySale && <Chip onClear={() => setOnlySale(false)}>On sale</Chip>}
            {inStockOnly && <Chip onClear={() => setInStockOnly(false)}>In stock</Chip>}
          </div>
        )}

        {/* count */}
        <p className="mb-5 text-sm text-muted">
          {loading ? "Updating…" : <><b className="text-foreground">{filtered.length}</b> product{filtered.length !== 1 && "s"}{filtersActive && " match your filters"}</>}
        </p>

        {/* grid */}
        {loading ? (
          <div className={cn("grid grid-cols-2 gap-4", cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
            {Array.from({ length: cols === 3 ? 6 : 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-surface flex flex-col items-center gap-3 p-14 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-surface-2 text-muted"><Search size={24} /></div>
            <p className="font-semibold">No products match your filters</p>
            <p className="text-sm text-muted">Try widening the price range, lowering the rating, or clearing a filter.</p>
            <Button variant="outline" onClick={reset}>Reset filters</Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${active}-${sort}-${minRating}-${cols}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("grid grid-cols-2 gap-4", cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}
              >
                {shown.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
              </motion.div>
            </AnimatePresence>

            {visible < filtered.length && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs text-muted">Showing {shown.length} of {filtered.length}</p>
                <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(shown.length / filtered.length) * 100}%` }} />
                </div>
                <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PER_PAGE)}>
                  Load more products
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 left-0 w-[min(85vw,20rem)] overflow-y-auto bg-surface p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-lg font-bold">Filters</span>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button>
              </div>
              {Filters}
              <div className="mt-6 flex gap-2">
                {filtersActive && <Button variant="ghost" className="flex-1" onClick={reset}>Clear all</Button>}
                <Button className="flex-1" onClick={() => setFiltersOpen(false)}>Show {filtered.length} results</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium">
      {children}
      <button onClick={onClear} aria-label="Remove filter" className="text-muted transition-colors hover:text-rose-500">
        <X size={13} />
      </button>
    </span>
  );
}

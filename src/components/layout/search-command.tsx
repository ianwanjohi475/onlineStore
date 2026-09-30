"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Search, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CategoryBadge } from "@/components/ui/category-icon";
import { ProductImage } from "@/components/product/product-image";
import { useCatalog } from "@/context/catalog";
import { searchProducts } from "@/lib/search";
import { formatPrice } from "@/lib/utils";

const trending = ["Earbuds", "Power bank", "Smartwatch", "Fast charger", "Speaker", "CCTV camera"];
const RECENT_KEY = "sv_recent_searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 6);
  } catch {
    return [];
  }
}
function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}

/** Search overlay: relevance-ranked results as you type, matching categories,
 *  recent + trending searches, and "see all results" → /shop?q=… */
export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, categories } = useCatalog();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setRecent(readRecent());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const result = useMemo(() => searchProducts(query, products, categories, 60), [query, products, categories]);
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  const goAll = (q = query) => {
    const v = q.trim();
    if (!v) return;
    saveRecent(v);
    onClose();
    router.push(`/shop?q=${encodeURIComponent(v)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[92] flex justify-center p-3 pt-[8vh] sm:p-4 sm:pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 h-fit w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <form onSubmit={(e) => { e.preventDefault(); goAll(); }} className="flex items-center gap-3 border-b border-border px-4">
              <Search size={18} className="shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands and categories…"
                aria-label="Search"
                enterKeyHint="search"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground">
                <X size={18} />
              </button>
            </form>

            <div className="max-h-[65vh] overflow-y-auto overscroll-contain p-2 sm:p-3">
              {query.trim() && (
                <>
                  {result.categories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2 px-1 pt-1">
                      {result.categories.map((c) => (
                        <Link key={c} href={`/categories/${c}`} onClick={() => { saveRecent(query.trim()); onClose(); }} className="inline-flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm font-medium hover:border-brand-500 hover:text-brand-600">
                          <CategoryBadge slug={c} className="size-7" size={15} /> {catName[c] ?? c}
                        </Link>
                      ))}
                    </div>
                  )}

                  {result.products.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted">
                      No matches for “{query}”. Try a simpler word, like “earbuds” or “charger”.
                    </div>
                  ) : (
                    <>
                      <p className="px-2 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-muted">Products</p>
                      {result.products.slice(0, 7).map((p) => (
                        <Link
                          key={p.slug}
                          href={`/product/${p.slug}`}
                          onClick={() => { saveRecent(query.trim()); onClose(); }}
                          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
                        >
                          <ProductImage product={p} className="size-12 shrink-0 rounded-lg border border-border" sizes="48px" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                            <p className="line-clamp-1 text-xs text-muted">{catName[p.category] ?? p.category} · {p.tagline}</p>
                          </div>
                          <span className="shrink-0 text-sm font-bold">{formatPrice(p.price)}</span>
                        </Link>
                      ))}
                      <button onClick={() => goAll()} className="mt-1 flex w-full items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300">
                        See all {result.products.length} results for “{query.trim()}” <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </>
              )}

              {!query.trim() && (
                <div className="flex flex-col gap-4 p-2">
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Clock size={13} /> Recent searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((t) => (
                          <button key={t} onClick={() => setQuery(t)} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm hover:text-brand-600">{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><TrendingUp size={13} /> Trending</p>
                    <div className="flex flex-wrap gap-2">
                      {trending.map((t) => (
                        <button key={t} onClick={() => setQuery(t)} className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-brand-500 hover:text-brand-600">{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Categories</p>
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                      {categories.map((c) => (
                        <Link key={c.slug} href={`/categories/${c.slug}`} onClick={onClose} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-surface-2">
                          <CategoryBadge slug={c.slug} className="size-8 rounded-lg" size={16} /> <span className="line-clamp-1">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

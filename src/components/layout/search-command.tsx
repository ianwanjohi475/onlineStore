"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/context/catalog";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";

const trending = ["Earbuds", "Power bank", "Smartwatch", "GaN charger", "Speaker"];

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useCatalog();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.tagline.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, products]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[92] flex justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="card-surface relative z-10 h-fit w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search size={18} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search earbuds, power banks, watches…"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <button onClick={onClose} aria-label="Close search" className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3">
              {query && results.length === 0 && (
                <p className="p-6 text-center text-sm text-muted">
                  No matches for “{query}”. Try “earbuds” or “power bank”.
                </p>
              )}

              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-surface-2"
                >
                  <ProductImage product={p} className="size-12 rounded-xl" glow={false} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">{p.tagline}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(p.price)}</span>
                </Link>
              ))}

              {!query && (
                <div className="p-3">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <TrendingUp size={13} /> Trending searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {t}
                      </button>
                    ))}
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

"use client";

import { createContext, useContext, useMemo } from "react";
import type { Category, Product, SiteSettings } from "@/lib/types";

interface CatalogValue {
  products: Product[];
  productMap: Record<string, Product>;
  categories: Category[];
  settings: SiteSettings;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  categories,
  settings,
  children,
}: {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      settings,
      productMap: Object.fromEntries(products.map((p) => [p.slug, p])),
    }),
    [products, categories, settings],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

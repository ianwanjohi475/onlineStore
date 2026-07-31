"use client";

import { ThemeProvider } from "next-themes";
import type { Category, Product, SiteSettings } from "@/lib/types";
import { CatalogProvider } from "./catalog";
import { CartProvider } from "./cart";
import { RecentlyViewedProvider } from "./recently-viewed";
import { ToastProvider } from "./toast";
import { WishlistProvider } from "./wishlist";

export function Providers({
  children,
  products,
  categories,
  settings,
}: {
  children: React.ReactNode;
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
}) {
  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <CatalogProvider products={products} categories={categories} settings={settings}>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider catalog={productMap} promos={settings.promos} freeShip={settings.freeShipThreshold} shippingFee={settings.shippingFee}>
              <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </CatalogProvider>
    </ThemeProvider>
  );
}

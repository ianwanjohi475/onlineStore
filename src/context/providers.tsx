"use client";

import { ThemeProvider } from "next-themes";
import { productMap } from "@/lib/data/products";
import { CartProvider } from "./cart";
import { RecentlyViewedProvider } from "./recently-viewed";
import { ToastProvider } from "./toast";
import { WishlistProvider } from "./wishlist";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider catalog={productMap}>
            <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

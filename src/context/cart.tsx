"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CartLine, Product } from "@/lib/types";

interface StoredLine {
  slug: string;
  quantity: number;
  color?: string;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number, color?: string) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  hydrated: boolean;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({
  children,
  catalog,
}: {
  children: React.ReactNode;
  catalog: Record<string, Product>;
}) {
  const [stored, setStored, hydrated] = useLocalStorage<StoredLine[]>("oraimo.cart", []);

  const lines = useMemo(
    () =>
      stored
        .map((s) => {
          const product = catalog[s.slug];
          return product ? { product, quantity: s.quantity, color: s.color } : null;
        })
        .filter(Boolean) as CartLine[],
    [stored, catalog],
  );

  const value: CartValue = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.product.price * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      hydrated,
      has: (slug) => stored.some((s) => s.slug === slug),
      add: (product, quantity = 1, color) =>
        setStored((prev) => {
          const existing = prev.find((s) => s.slug === product.slug);
          if (existing)
            return prev.map((s) =>
              s.slug === product.slug ? { ...s, quantity: s.quantity + quantity, color: color ?? s.color } : s,
            );
          return [...prev, { slug: product.slug, quantity, color }];
        }),
      remove: (slug) => setStored((prev) => prev.filter((s) => s.slug !== slug)),
      setQuantity: (slug, quantity) =>
        setStored((prev) =>
          quantity <= 0
            ? prev.filter((s) => s.slug !== slug)
            : prev.map((s) => (s.slug === slug ? { ...s, quantity } : s)),
        ),
      clear: () => setStored([]),
    };
  }, [lines, stored, setStored, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

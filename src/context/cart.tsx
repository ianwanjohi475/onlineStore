"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CartLine, Product, PromoCode } from "@/lib/types";

interface StoredLine {
  slug: string;
  quantity: number;
  color?: string;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  promoLabel: string | null;
  freeShipThreshold: number;
  freeShipProgress: number;
  add: (product: Product, quantity?: number, color?: string) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({
  children,
  catalog,
  promos,
  freeShip,
  shippingFee,
}: {
  children: React.ReactNode;
  catalog: Record<string, Product>;
  promos: PromoCode[];
  freeShip: number;
  shippingFee: number;
}) {
  const [stored, setStored, hydrated] = useLocalStorage<StoredLine[]>("oraimo.cart", []);
  const [promoCode, setPromoCode] = useLocalStorage<string | null>("oraimo.promo", null);

  const promoMap = useMemo(
    () => Object.fromEntries(promos.map((p) => [p.code.toUpperCase(), p])),
    [promos],
  );

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
    const savings = lines.reduce(
      (n, l) => n + (l.product.compareAt ? (l.product.compareAt - l.product.price) * l.quantity : 0),
      0,
    );
    const promo = promoCode ? promoMap[promoCode] : undefined;
    const discount = promo?.kind === "percent" ? Math.round((subtotal * (promo.value ?? 0)) / 100) : 0;
    const freeShipUnlocked = subtotal >= freeShip || promo?.kind === "ship";
    const shipping = subtotal === 0 || freeShipUnlocked ? 0 : shippingFee;
    const total = Math.max(0, subtotal - discount) + shipping;

    return {
      lines, count, subtotal, savings, discount, shipping, total,
      promoCode: promo ? promoCode : null,
      promoLabel: promo?.label ?? null,
      freeShipThreshold: freeShip,
      freeShipProgress: Math.min(100, (subtotal / freeShip) * 100),
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
          quantity <= 0 ? prev.filter((s) => s.slug !== slug) : prev.map((s) => (s.slug === slug ? { ...s, quantity } : s)),
        ),
      clear: () => setStored([]),
      applyPromo: (code) => {
        const key = code.trim().toUpperCase();
        if (promoMap[key]) { setPromoCode(key); return true; }
        return false;
      },
      clearPromo: () => setPromoCode(null),
    };
  }, [lines, stored, setStored, promoCode, setPromoCode, promoMap, freeShip, shippingFee, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

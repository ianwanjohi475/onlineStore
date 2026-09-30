"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Product } from "@/lib/types";

export interface AddedItem {
  product: Product;
  quantity: number;
  /** changes on every add so the panel re-animates */
  key: number;
}

interface CartDrawerValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  openCart: () => void;
  /** the "Added to cart" confirmation panel */
  added: AddedItem | null;
  showAdded: (product: Product, quantity: number) => void;
  hideAdded: () => void;
}

const CartDrawerContext = createContext<CartDrawerValue>({
  open: false,
  setOpen: () => {},
  openCart: () => {},
  added: null,
  showAdded: () => {},
  hideAdded: () => {},
});

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<AddedItem | null>(null);
  const showAdded = useCallback((product: Product, quantity: number) => setAdded({ product, quantity, key: Date.now() }), []);
  const hideAdded = useCallback(() => setAdded(null), []);
  return (
    <CartDrawerContext.Provider value={{ open, setOpen, openCart: () => setOpen(true), added, showAdded, hideAdded }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export const useCartDrawer = () => useContext(CartDrawerContext);

"use client";

import { createContext, useContext, useState } from "react";

interface CartDrawerValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  openCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerValue>({ open: false, setOpen: () => {}, openCart: () => {} });

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ open, setOpen, openCart: () => setOpen(true) }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export const useCartDrawer = () => useContext(CartDrawerContext);

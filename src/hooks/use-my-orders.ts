"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "sv_my_orders";
const MAX = 25;

export interface MyOrder {
  number: string;
  date: string;
}

function read(): MyOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as MyOrder[]) : [];
    return Array.isArray(parsed) ? parsed.filter((o) => o && typeof o.number === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Remembers the orders placed on this device, so a shopper never has to
 * memorise an order number — their orders just show up (guest-checkout
 * equivalent of Amazon/Walmart's "Your Orders").
 */
export function useMyOrders() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOrders(read());
    setHydrated(true);
  }, []);

  const add = useCallback((number: string) => {
    if (!number) return;
    const next = [{ number, date: new Date().toISOString() }, ...read().filter((o) => o.number !== number)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode) — keep it in memory only */
    }
    setOrders(next);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setOrders([]);
  }, []);

  return { orders, hydrated, add, clear };
}

/** Record an order outside React (e.g. straight after checkout succeeds). */
export function rememberOrder(number: string) {
  if (!number) return;
  try {
    const next = [{ number, date: new Date().toISOString() }, ...read().filter((o) => o.number !== number)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

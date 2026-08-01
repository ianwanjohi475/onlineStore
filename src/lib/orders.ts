import type { OrderStatus, PaymentStatus } from "@/lib/types";

/** Fulfilment statuses in workflow order. */
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out-for-delivery",
  "delivered",
  "cancelled",
  "refunded",
  "returned",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially-refunded",
];

export const PAYMENT_METHODS = ["M-Pesa", "Card", "Bank Transfer", "PayPal", "Cash on Delivery"];

/** Statuses that count as an open/active order (not closed out). */
export const OPEN_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out-for-delivery",
];

export const COMPLETED_STATUSES: OrderStatus[] = ["delivered"];
export const CANCELLED_STATUSES: OrderStatus[] = ["cancelled", "refunded", "returned"];

export function titleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CategorySlug, Order, Product, StoreData } from "@/lib/types";
import { seed } from "./seed";
import { bumpStore } from "./events";

/** Backfill fields that older persisted orders may be missing. */
function normalizeOrder(o: Order): Order {
  return {
    ...o,
    paymentStatus: o.paymentStatus ?? (o.status === "cancelled" ? "refunded" : o.status === "pending" ? "pending" : "paid"),
    timeline: o.timeline ?? [{ at: o.date, label: "Order placed" }],
    notes: o.notes ?? [],
    refunded: o.refunded ?? 0,
  };
}

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "store.json");

function ensure() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(seed, null, 2));
  }
}

export function readStore(): StoreData {
  ensure();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as StoreData;
    // Drop auto-generated keyword stock photos — they looked random/unprofessional.
    // Real image URLs set in the admin are kept; everything else uses the clean render.
    const products = (raw.products ?? seed.products).map((p) =>
      p.image && p.image.includes("loremflickr") ? { ...p, image: null } : p,
    );
    // guard against partial files
    return {
      products,
      categories: raw.categories ?? seed.categories,
      brands: raw.brands ?? seed.brands,
      testimonials: raw.testimonials ?? seed.testimonials,
      orders: (raw.orders ?? seed.orders).map(normalizeOrder),
      settings: { ...seed.settings, ...raw.settings },
      suspendedCustomers: raw.suspendedCustomers ?? [],
    };
  } catch {
    return seed;
  }
}

export function writeStore(data: StoreData, scope = "store") {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  // notify connected clients (dashboards, storefront) that data changed
  bumpStore(scope);
}

/* ── storefront getters ─────────────────────────────────── */
export function getProducts(): Product[] {
  return readStore().products;
}
export function getProduct(slug: string): Product | undefined {
  return readStore().products.find((p) => p.slug === slug);
}
export function getCategories() {
  return readStore().categories;
}
export function getCategory(slug: string) {
  return readStore().categories.find((c) => c.slug === slug);
}
export function getSettings() {
  return readStore().settings;
}
export function getByCategory(slug: CategorySlug) {
  return readStore().products.filter((p) => p.category === slug);
}
export function getBestSellers() {
  return readStore().products.filter((p) => p.badges.includes("bestseller"));
}
export function getNewArrivals() {
  return readStore().products.filter((p) => p.badges.includes("new"));
}
export function getFlashSale() {
  return readStore().products.filter((p) => p.compareAt);
}
export function getRelated(product: Product, limit = 4): Product[] {
  const all = readStore().products;
  return all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(all.filter((p) => p.category !== product.category && p.slug !== product.slug))
    .slice(0, limit);
}
export function getTestimonials() {
  return readStore().testimonials;
}
export function getBrands() {
  return readStore().brands;
}
export function getBrand(slug: string) {
  return readStore().brands.find((b) => b.slug === slug);
}
export function getOrders() {
  return readStore().orders;
}
export function addOrder(order: import("@/lib/types").Order) {
  const store = readStore();
  store.orders.unshift(order);
  // Decrement inventory for each ordered item and flag anything that sells out.
  for (const item of order.items) {
    const product = store.products.find((p) => p.slug === item.slug);
    if (!product) continue;
    if (typeof product.stock === "number") {
      product.stock = Math.max(0, product.stock - item.quantity);
      if (product.stock === 0) product.inStock = false;
    }
  }
  writeStore(store, "order");
}
/** Only active slides currently within their optional schedule window. */
export function getActiveSlides() {
  const now = Date.now();
  return readStore().settings.heroSlides.filter((s) => {
    if (s.active === false) return false;
    if (s.startDate && new Date(s.startDate).getTime() > now) return false;
    if (s.endDate && new Date(s.endDate).getTime() < now) return false;
    return true;
  });
}

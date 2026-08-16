import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CategorySlug, Order, Product, StoreData } from "@/lib/types";
import { seed } from "./seed";
import { bumpStore } from "./events";

/**
 * Data layer for SIR VERT ENTERPRISE.
 * Everything is persisted to a local JSON file (data/store.json). Simple,
 * dependable and zero-config — no external database to provision, meter, or
 * keep alive. The app calls the async getters below so the storefront and admin
 * always read and write the same source of truth.
 */

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

/** Drop the old auto-generated keyword stock photos; keep real/uploaded images. */
function cleanProduct(p: Product): Product {
  return p.image && p.image.includes("loremflickr") ? { ...p, image: null } : p;
}

function assemble(raw: Partial<StoreData>): StoreData {
  return {
    products: (raw.products ?? seed.products).map(cleanProduct),
    categories: raw.categories ?? seed.categories,
    brands: raw.brands ?? seed.brands,
    testimonials: raw.testimonials ?? seed.testimonials,
    orders: (raw.orders ?? seed.orders).map(normalizeOrder),
    settings: { ...seed.settings, ...raw.settings },
    suspendedCustomers: raw.suspendedCustomers ?? [],
  };
}

/* ── File store ───────────────────────────────────────────── */
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "store.json");

/**
 * Bump this whenever the code-managed catalogue changes (new products, photos,
 * categories, branding, hero slides…). On the next read, an older saved file is
 * refreshed to the new catalogue automatically — while the shop's real ORDERS
 * and customer suspensions are preserved. Admin edits made after a refresh
 * persist normally (every save re-stamps the current version).
 */
const SEED_VERSION = 4;

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(DIR, { recursive: true });
    writeFile(seed);
  }
}
function readFile(): StoreData {
  ensureFile();
  let parsed: (StoreData & { seedVersion?: number }) | null = null;
  try {
    parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as StoreData & { seedVersion?: number };
  } catch {
    return seed;
  }
  if (!parsed) return seed;
  // Catalogue changed in code → refresh it, but keep real orders + suspensions.
  if ((parsed.seedVersion ?? 0) < SEED_VERSION) {
    const refreshed = assemble({ orders: parsed.orders, suspendedCustomers: parsed.suspendedCustomers });
    writeFile(refreshed);
    return refreshed;
  }
  return assemble(parsed);
}
function writeFile(data: StoreData) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify({ ...data, seedVersion: SEED_VERSION }, null, 2));
}

/* ── Public API ───────────────────────────────────────────── */
export async function readStore(): Promise<StoreData> {
  return readFile();
}

export async function writeStore(data: StoreData, scope = "store") {
  writeFile(data);
  bumpStore(scope);
}

export async function getProducts(): Promise<Product[]> {
  return (await readStore()).products;
}
export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await readStore()).products.find((p) => p.slug === slug);
}
export async function getCategories() {
  return (await readStore()).categories;
}
export async function getCategory(slug: string) {
  return (await readStore()).categories.find((c) => c.slug === slug);
}
export async function getSettings() {
  return (await readStore()).settings;
}
export async function getByCategory(slug: CategorySlug) {
  return (await readStore()).products.filter((p) => p.category === slug);
}
export async function getBestSellers() {
  return (await readStore()).products.filter((p) => p.badges.includes("bestseller"));
}
export async function getNewArrivals() {
  return (await readStore()).products.filter((p) => p.badges.includes("new"));
}
export async function getFlashSale() {
  return (await readStore()).products.filter((p) => p.compareAt);
}
export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = (await readStore()).products;
  return all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(all.filter((p) => p.category !== product.category && p.slug !== product.slug))
    .slice(0, limit);
}
export async function getTestimonials() {
  return (await readStore()).testimonials;
}
export async function getBrands() {
  return (await readStore()).brands;
}
export async function getBrand(slug: string) {
  return (await readStore()).brands.find((b) => b.slug === slug);
}
export async function getOrders() {
  return (await readStore()).orders;
}

/** Record a new order and decrement inventory. */
export async function addOrder(order: Order) {
  const store = readFile();
  store.orders.unshift(order);
  for (const item of order.items) {
    const product = store.products.find((p) => p.slug === item.slug);
    if (product && typeof product.stock === "number") {
      product.stock = Math.max(0, product.stock - item.quantity);
      if (product.stock === 0) product.inStock = false;
    }
  }
  writeFile(store);
  bumpStore("order");
}

/** Delete every order (and therefore every derived customer). Used for a fresh start. */
export async function clearOrders() {
  const store = readFile();
  store.orders = [];
  writeFile(store);
  bumpStore("order");
}

/** Delete a single order by id. */
export async function deleteOrder(id: string) {
  const store = readFile();
  store.orders = store.orders.filter((o) => o.id !== id);
  writeFile(store);
  bumpStore("order");
}

/** Apply a change to a single order (status, payment, notes, archive…). */
export async function updateOrder(id: string, mutate: (o: Order) => Order): Promise<Order | null> {
  const store = readFile();
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated = mutate(normalizeOrder(store.orders[idx]));
  store.orders[idx] = updated;
  writeFile(store);
  bumpStore("order");
  return updated;
}

/** Only active slides currently within their optional schedule window. */
export async function getActiveSlides() {
  const now = Date.now();
  return (await readStore()).settings.heroSlides.filter((s) => {
    if (s.active === false) return false;
    if (s.startDate && new Date(s.startDate).getTime() > now) return false;
    if (s.endDate && new Date(s.endDate).getTime() < now) return false;
    return true;
  });
}

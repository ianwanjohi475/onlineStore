import "server-only";
import fs from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";
import type { CategorySlug, Order, Product, StoreData } from "@/lib/types";
import { seed } from "./seed";
import { bumpStore } from "./events";

/**
 * Data layer for SIR VERT ENTERPRISE, with two persistence backends:
 *   • Vercel Blob  → durable, shared across every serverless instance
 *                    (active when BLOB_READ_WRITE_TOKEN is set — Vercel sets it
 *                    automatically once a Blob store is connected to the project).
 *   • Local file   → data/store.json for local dev and any host with a writable
 *                    disk. Best-effort, silently skipped on read-only filesystems.
 * Either way the app talks to the async getters below, so the storefront and
 * admin always read and write the same source of truth.
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

/**
 * Bump this whenever the code-managed catalogue changes (new products, photos,
 * categories, branding, hero slides…). On the next read, older saved data is
 * refreshed to the new catalogue automatically — while the shop's real ORDERS
 * and customer suspensions are preserved. Admin edits made after a refresh
 * persist normally (every save re-stamps the current version).
 */
const SEED_VERSION = 9;

type Persisted = StoreData & { seedVersion?: number };

/** Apply the seed-version refresh to parsed data (keep real orders + suspensions). */
function refreshed(parsed: Persisted): StoreData {
  if ((parsed.seedVersion ?? 0) < SEED_VERSION) {
    return assemble({ orders: parsed.orders, suspendedCustomers: parsed.suspendedCustomers });
  }
  return assemble(parsed);
}

/* ── Blob backend (durable, shared) ───────────────────────── */
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_KEY = "store/store.json";

async function loadFromBlob(): Promise<StoreData | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return refreshed((await res.json()) as Persisted);
  } catch {
    return null;
  }
}

async function saveToBlob(data: StoreData) {
  try {
    await put(BLOB_KEY, JSON.stringify({ ...data, seedVersion: SEED_VERSION }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
  } catch (e) {
    console.warn("[store] Blob save failed:", e instanceof Error ? e.message : e);
  }
}

/* ── File backend (local dev / writable hosts) ────────────── */
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "store.json");

function loadFromFile(): StoreData {
  try {
    if (fs.existsSync(FILE)) {
      return refreshed(JSON.parse(fs.readFileSync(FILE, "utf8")) as Persisted);
    }
  } catch {
    /* corrupt / unreadable — fall through to seed */
  }
  return assemble({});
}

function saveToFile(data: StoreData) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ ...data, seedVersion: SEED_VERSION }, null, 2));
  } catch {
    /* read-only FS (e.g. Vercel serverless) — ignore */
  }
}

/* ── Load / commit with a short shared cache ──────────────── */
let mem: StoreData | null = null;
let memAt = 0;
const CACHE_MS = 3000; // one render shares a single load; writes always read fresh

/** Current store. `fresh` bypasses the cache (used before every mutation so we
 *  never overwrite an order another instance just wrote). */
async function currentStore(fresh = false): Promise<StoreData> {
  if (!fresh && mem && Date.now() - memAt < CACHE_MS) return mem;
  const data = (BLOB_ON ? await loadFromBlob() : null) ?? loadFromFile();
  mem = data;
  memAt = Date.now();
  return data;
}

/** Persist a mutated store to the active backend and refresh the cache. */
async function commit(data: StoreData) {
  mem = data;
  memAt = Date.now();
  if (BLOB_ON) await saveToBlob(data);
  else saveToFile(data);
}

/* ── Public API ───────────────────────────────────────────── */
export async function readStore(): Promise<StoreData> {
  return currentStore();
}

export async function writeStore(data: StoreData, scope = "store") {
  await commit(data);
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
  const store = await currentStore(true);
  store.orders.unshift(order);
  for (const item of order.items) {
    const product = store.products.find((p) => p.slug === item.slug);
    if (product && typeof product.stock === "number") {
      product.stock = Math.max(0, product.stock - item.quantity);
      if (product.stock === 0) product.inStock = false;
    }
  }
  await commit(store);
  bumpStore("order");
}

/** Delete every order (and therefore every derived customer). Used for a fresh start. */
export async function clearOrders() {
  const store = await currentStore(true);
  store.orders = [];
  await commit(store);
  bumpStore("order");
}

/** Delete a single order by id. */
export async function deleteOrder(id: string) {
  const store = await currentStore(true);
  store.orders = store.orders.filter((o) => o.id !== id);
  await commit(store);
  bumpStore("order");
}

/** Apply a change to a single order (status, payment, notes, archive…). */
export async function updateOrder(id: string, mutate: (o: Order) => Order): Promise<Order | null> {
  const store = await currentStore(true);
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated = mutate(normalizeOrder(store.orders[idx]));
  store.orders[idx] = updated;
  await commit(store);
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

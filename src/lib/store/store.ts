import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CategorySlug, Order, Product, StoreData } from "@/lib/types";
import { seed } from "./seed";
import { bumpStore } from "./events";
import { hasDb, q, withTx } from "@/lib/db";

/**
 * Data layer with two interchangeable backends:
 *   • DATABASE_URL set  → Postgres / CockroachDB (durable, scales, multi-instance)
 *   • DATABASE_URL unset → local data/store.json file (great for quick local dev)
 * Everything the app calls goes through the async getters below, so the rest of
 * the code doesn't care which backend is live.
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

/* ── File backend ─────────────────────────────────────────── */
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "store.json");

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(seed, null, 2));
  }
}
function readFile(): StoreData {
  ensureFile();
  try {
    return assemble(JSON.parse(fs.readFileSync(FILE, "utf8")) as StoreData);
  } catch {
    return seed;
  }
}
function writeFile(data: StoreData) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* ── Postgres backend ─────────────────────────────────────── */
let ready: Promise<void> | null = null;

async function ensureReady() {
  if (!ready) ready = init();
  return ready;
}

async function init() {
  await q(`CREATE TABLE IF NOT EXISTS products (slug TEXT PRIMARY KEY, category TEXT, position INT DEFAULT 0, data JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, position INT DEFAULT 0, data JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS brands (slug TEXT PRIMARY KEY, position INT DEFAULT 0, data JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, position INT DEFAULT 0, data JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now(), data JSONB NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, data JSONB NOT NULL)`);

  const [{ count }] = await q<{ count: string }>(`SELECT count(*)::int AS count FROM products`);
  if (Number(count) === 0) await seedDb();
}

/** Populate an empty database with the default catalogue. */
async function seedDb() {
  await withTx(async (c) => {
    for (let i = 0; i < seed.products.length; i++) {
      const p = seed.products[i];
      await c.query(`INSERT INTO products (slug, category, position, data) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING`, [p.slug, p.category, i, JSON.stringify(p)]);
    }
    for (let i = 0; i < seed.categories.length; i++) {
      const cat = seed.categories[i];
      await c.query(`INSERT INTO categories (slug, position, data) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING`, [cat.slug, i, JSON.stringify(cat)]);
    }
    for (let i = 0; i < seed.brands.length; i++) {
      const b = seed.brands[i];
      await c.query(`INSERT INTO brands (slug, position, data) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING`, [b.slug, i, JSON.stringify(b)]);
    }
    for (let i = 0; i < seed.testimonials.length; i++) {
      const t = seed.testimonials[i];
      await c.query(`INSERT INTO testimonials (id, position, data) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`, [t.id, i, JSON.stringify(t)]);
    }
    for (const o of seed.orders) {
      await c.query(`INSERT INTO orders (id, created_at, data) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`, [o.id, o.date, JSON.stringify(o)]);
    }
    await c.query(`INSERT INTO settings (id, data) VALUES ('singleton',$1) ON CONFLICT (id) DO NOTHING`, [
      JSON.stringify({ settings: seed.settings, suspendedCustomers: seed.suspendedCustomers ?? [] }),
    ]);
  });
}

async function readStoreDb(): Promise<StoreData> {
  await ensureReady();
  const [products, categories, brands, testimonials, orders, settingsRows] = await Promise.all([
    q<{ data: Product }>(`SELECT data FROM products ORDER BY position`),
    q<{ data: StoreData["categories"][number] }>(`SELECT data FROM categories ORDER BY position`),
    q<{ data: StoreData["brands"][number] }>(`SELECT data FROM brands ORDER BY position`),
    q<{ data: StoreData["testimonials"][number] }>(`SELECT data FROM testimonials ORDER BY position`),
    q<{ data: Order }>(`SELECT data FROM orders ORDER BY data->>'date' DESC`),
    q<{ data: { settings: StoreData["settings"]; suspendedCustomers: string[] } }>(`SELECT data FROM settings WHERE id='singleton'`),
  ]);
  const s = settingsRows[0]?.data;
  return assemble({
    products: products.map((r) => r.data),
    categories: categories.map((r) => r.data),
    brands: brands.map((r) => r.data),
    testimonials: testimonials.map((r) => r.data),
    orders: orders.map((r) => r.data),
    settings: s?.settings,
    suspendedCustomers: s?.suspendedCustomers ?? [],
  });
}

/** Rewrite the catalogue + settings tables. Orders are managed separately (addOrder/updateOrder). */
async function writeStoreDb(data: StoreData) {
  await ensureReady();
  await withTx(async (c) => {
    await c.query(`DELETE FROM products`);
    for (let i = 0; i < data.products.length; i++) {
      const p = data.products[i];
      await c.query(`INSERT INTO products (slug, category, position, data) VALUES ($1,$2,$3,$4)`, [p.slug, p.category, i, JSON.stringify(p)]);
    }
    await c.query(`DELETE FROM categories`);
    for (let i = 0; i < data.categories.length; i++) {
      await c.query(`INSERT INTO categories (slug, position, data) VALUES ($1,$2,$3)`, [data.categories[i].slug, i, JSON.stringify(data.categories[i])]);
    }
    await c.query(`DELETE FROM brands`);
    for (let i = 0; i < data.brands.length; i++) {
      await c.query(`INSERT INTO brands (slug, position, data) VALUES ($1,$2,$3)`, [data.brands[i].slug, i, JSON.stringify(data.brands[i])]);
    }
    await c.query(`DELETE FROM testimonials`);
    for (let i = 0; i < data.testimonials.length; i++) {
      await c.query(`INSERT INTO testimonials (id, position, data) VALUES ($1,$2,$3)`, [data.testimonials[i].id, i, JSON.stringify(data.testimonials[i])]);
    }
    await c.query(`INSERT INTO settings (id, data) VALUES ('singleton',$1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`, [
      JSON.stringify({ settings: data.settings, suspendedCustomers: data.suspendedCustomers ?? [] }),
    ]);
  });
}

/** Insert one order and decrement stock — a targeted, concurrency-safe write. */
async function addOrderDb(order: Order) {
  await ensureReady();
  await withTx(async (c) => {
    await c.query(`INSERT INTO orders (id, created_at, data) VALUES ($1, now(), $2)`, [order.id, JSON.stringify(order)]);
    for (const item of order.items) {
      await c.query(
        `UPDATE products
           SET data = jsonb_set(
             jsonb_set(data, '{stock}', to_jsonb(GREATEST(0, COALESCE((data->>'stock')::int, 0) - $2))),
             '{inStock}', to_jsonb(GREATEST(0, COALESCE((data->>'stock')::int, 0) - $2) > 0))
         WHERE slug = $1 AND (data ? 'stock')`,
        [item.slug, item.quantity],
      );
    }
  });
}

async function updateOrderDb(id: string, mutate: (o: Order) => Order): Promise<Order | null> {
  await ensureReady();
  return withTx(async (c) => {
    const rows = (await c.query(`SELECT data FROM orders WHERE id=$1 FOR UPDATE`, [id])).rows as { data: Order }[];
    if (!rows[0]) return null;
    const updated = mutate(normalizeOrder(rows[0].data));
    await c.query(`UPDATE orders SET data=$2 WHERE id=$1`, [id, JSON.stringify(updated)]);
    return updated;
  });
}

/* ── Public API (backend-agnostic) ────────────────────────── */
export async function readStore(): Promise<StoreData> {
  return hasDb ? readStoreDb() : readFile();
}

export async function writeStore(data: StoreData, scope = "store") {
  if (hasDb) await writeStoreDb(data);
  else writeFile(data);
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
  if (hasDb) {
    await addOrderDb(order);
  } else {
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
  }
  bumpStore("order");
}

/** Apply a change to a single order (status, payment, notes, archive…). */
export async function updateOrder(id: string, mutate: (o: Order) => Order): Promise<Order | null> {
  let updated: Order | null;
  if (hasDb) {
    updated = await updateOrderDb(id, mutate);
  } else {
    const store = readFile();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    updated = mutate(normalizeOrder(store.orders[idx]));
    store.orders[idx] = updated;
    writeFile(store);
  }
  if (updated) bumpStore("order");
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

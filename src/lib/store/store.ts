import "server-only";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import type { InStatement } from "@libsql/client";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";
import type { CategorySlug, Order, Product, StoreData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { complementaryProducts, similarProducts } from "@/lib/search";
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
const SEED_VERSION = 11;

type Persisted = StoreData & { seedVersion?: number };

/** Apply the seed-version refresh to parsed data (keep real orders + suspensions). */
function refreshed(parsed: Persisted): StoreData {
  // Once the shop has its own products, keep everything as the admin left it.
  if ((parsed.seedVersion ?? 0) < SEED_VERSION && !parsed.products?.length) {
    // keep the shop's real data: orders, suspensions and the admin's settings
    return assemble({ orders: parsed.orders, suspendedCustomers: parsed.suspendedCustomers, settings: parsed.settings });
  }
  return assemble(parsed);
}

/* ── Blob backend (durable, shared) ───────────────────────── */
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;
/** Old, guessable location — only read once to migrate, then deleted. */
const LEGACY_BLOB_KEY = "store/store.json";
/** Blob URLs are public, so the store lives at a path derived from the secret
 *  token: nobody can find (and read orders / customer details from) it by URL. */
const BLOB_KEY = `private/store-${createHash("sha256").update(`store:${process.env.BLOB_READ_WRITE_TOKEN ?? ""}`).digest("hex").slice(0, 40)}.json`;

async function readBlob(key: string): Promise<Persisted | null> {
  const { blobs } = await list({ prefix: key, limit: 1 });
  const blob = blobs.find((b) => b.pathname === key);
  if (!blob) return null;
  const res = await fetch(blob.url, { cache: "no-store" });
  return res.ok ? ((await res.json()) as Persisted) : null;
}

async function loadFromBlob(): Promise<StoreData | null> {
  try {
    const current = await readBlob(BLOB_KEY);
    if (current) return refreshed(current);
    const legacy = await readBlob(LEGACY_BLOB_KEY);
    if (!legacy) return null;
    const data = refreshed(legacy);
    await saveToBlob(data);
    await del(LEGACY_BLOB_KEY).catch(() => {});
    return data;
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

/* ── Turso backend (real tables, durable + concurrency-safe) ─ */

/** Read the whole catalogue + orders back out of the tables. */
async function loadFromTurso(): Promise<StoreData | null> {
  try {
    await ensureSchema();
    const c = db();
    const [products, categories, brands, testimonials, orders, settings, suspended, meta] = await Promise.all([
      c.execute("SELECT data FROM products ORDER BY position"),
      c.execute("SELECT data FROM categories ORDER BY position"),
      c.execute("SELECT data FROM brands ORDER BY position"),
      c.execute("SELECT data FROM testimonials ORDER BY position"),
      c.execute("SELECT data FROM orders ORDER BY created_at DESC"),
      c.execute("SELECT data FROM settings WHERE id = 'singleton'"),
      c.execute("SELECT email FROM suspended_customers"),
      c.execute("SELECT value FROM meta WHERE key = 'seedVersion'"),
    ]);

    const seedVersion = Number(meta.rows[0]?.value ?? 0);
    // Seed the starter catalogue ONLY into an empty database. Once the shop has
    // products, the admin owns them — updates to the site never overwrite
    // products, prices, stock, banners or settings edited in the admin.
    if (products.rows.length > 0 && seedVersion < SEED_VERSION) {
      await c.execute({ sql: "INSERT INTO meta (key, value) VALUES ('seedVersion', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", args: [String(SEED_VERSION)] });
    }
    if (products.rows.length === 0) {
      const keepOrders = orders.rows.map((r) => JSON.parse(String(r.data)) as Order);
      const keepSettings = settings.rows[0] ? (JSON.parse(String(settings.rows[0].data)) as StoreData["settings"]) : undefined;
      const fresh = assemble({ orders: keepOrders, suspendedCustomers: suspended.rows.map((r) => String(r.email)), settings: keepSettings });
      await seedTurso(fresh);
      return fresh;
    }

    const parse = <T>(rows: { data: unknown }[]) => rows.map((r) => JSON.parse(String(r.data)) as T);
    return assemble({
      products: parse<Product>(products.rows as unknown as { data: unknown }[]),
      categories: parse<StoreData["categories"][number]>(categories.rows as unknown as { data: unknown }[]),
      brands: parse<StoreData["brands"][number]>(brands.rows as unknown as { data: unknown }[]),
      testimonials: parse<StoreData["testimonials"][number]>(testimonials.rows as unknown as { data: unknown }[]),
      orders: parse<Order>(orders.rows as unknown as { data: unknown }[]),
      settings: settings.rows[0] ? (JSON.parse(String(settings.rows[0].data)) as StoreData["settings"]) : undefined,
      suspendedCustomers: suspended.rows.map((r) => String(r.email)),
    });
  } catch (e) {
    console.warn("[store] Turso read failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Write the code-managed catalogue + settings into the tables (keeps orders). */
async function seedTurso(data: StoreData) {
  const c = db();
  const stmts: InStatement[] = [
    { sql: "DELETE FROM products", args: [] },
    { sql: "DELETE FROM categories", args: [] },
    { sql: "DELETE FROM brands", args: [] },
    { sql: "DELETE FROM testimonials", args: [] },
  ];
  data.products.forEach((p, i) =>
    stmts.push({
      sql: "INSERT INTO products (slug, category, position, stock, in_stock, data) VALUES (?,?,?,?,?,?)",
      args: [p.slug, p.category, i, p.stock ?? null, p.inStock === false ? 0 : 1, JSON.stringify(p)],
    }),
  );
  data.categories.forEach((x, i) => stmts.push({ sql: "INSERT INTO categories (slug, position, data) VALUES (?,?,?)", args: [x.slug, i, JSON.stringify(x)] }));
  data.brands.forEach((x, i) => stmts.push({ sql: "INSERT INTO brands (slug, position, data) VALUES (?,?,?)", args: [x.slug, i, JSON.stringify(x)] }));
  data.testimonials.forEach((x, i) => stmts.push({ sql: "INSERT INTO testimonials (id, position, data) VALUES (?,?,?)", args: [x.id, i, JSON.stringify(x)] }));
  stmts.push({ sql: "INSERT INTO settings (id, data) VALUES ('singleton', ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data", args: [JSON.stringify(data.settings)] });
  stmts.push({ sql: "INSERT INTO meta (key, value) VALUES ('seedVersion', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", args: [String(SEED_VERSION)] });
  await c.batch(stmts, "write");
}

/** Insert ONE order and decrement its stock — no whole-store rewrite, so two
 *  shoppers checking out at the same moment can't overwrite each other. */
async function addOrderTurso(order: Order) {
  await ensureSchema();
  const stmts: InStatement[] = [
    {
      sql: `INSERT INTO orders (id, number, created_at, status, payment_status, total, customer_email, customer_phone, archived, data)
            VALUES (?,?,?,?,?,?,?,?,0,?)`,
      args: [order.id, order.number, order.date, order.status, order.paymentStatus, order.total, order.customer.email ?? "", order.customer.phone ?? "", JSON.stringify(order)],
    },
  ];
  for (const item of order.items) {
    stmts.push({
      sql: `UPDATE products
            SET stock = MAX(0, COALESCE(stock, 0) - ?),
                in_stock = CASE WHEN COALESCE(stock, 0) - ? <= 0 THEN 0 ELSE 1 END,
                data = json_set(json_set(data, '$.stock', MAX(0, COALESCE(stock,0) - ?)),
                                '$.inStock', json(CASE WHEN COALESCE(stock,0) - ? <= 0 THEN 'false' ELSE 'true' END))
            WHERE slug = ? AND stock IS NOT NULL`,
      args: [item.quantity, item.quantity, item.quantity, item.quantity, item.slug],
    });
  }
  await db().batch(stmts, "write");
}

/* ── Load / commit with a short shared cache ──────────────── */
let mem: StoreData | null = null;
let memAt = 0;
const CACHE_MS = 3000; // one render shares a single load; writes always read fresh

/** Current store. `fresh` bypasses the cache (used before every mutation so we
 *  never overwrite an order another instance just wrote). */
async function currentStore(fresh = false): Promise<StoreData> {
  if (!fresh && mem && Date.now() - memAt < CACHE_MS) return mem;
  const data =
    (TURSO_ON ? await loadFromTurso() : null) ??
    (BLOB_ON ? await loadFromBlob() : null) ??
    loadFromFile();
  mem = data;
  memAt = Date.now();
  return data;
}

/** Persist a mutated store to the active backend and refresh the cache. */
async function commit(data: StoreData) {
  mem = data;
  memAt = Date.now();
  if (TURSO_ON) await seedTurso(data);
  else if (BLOB_ON) await saveToBlob(data);
  else saveToFile(data);
}

/** Mark every cached page stale so the next visit shows fresh data (admin edits,
 *  new orders, stock changes). Only valid inside a request (Route Handler) —
 *  silently skipped during build-time seeding. */
function refreshSite() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* not in a request context (e.g. static build) */
  }
}

/* ── Public API ───────────────────────────────────────────── */
export async function readStore(): Promise<StoreData> {
  return currentStore();
}

export async function writeStore(data: StoreData, scope = "store") {
  await commit(data);
  bumpStore(scope);
  refreshSite();
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
export async function getRelated(product: Product, limit = 8): Promise<Product[]> {
  return similarProducts(product, (await readStore()).products, limit);
}
export async function getComplementary(product: Product, limit = 4): Promise<Product[]> {
  return complementaryProducts(product, (await readStore()).products, limit);
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
  if (TURSO_ON) {
    await addOrderTurso(order);
    mem = null; // force a fresh read next time
    bumpStore("order");
    refreshSite();
    return;
  }
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
  refreshSite();
}

/** Delete every order (and therefore every derived customer). Used for a fresh start. */
export async function clearOrders() {
  if (TURSO_ON) {
    await ensureSchema();
    await db().execute("DELETE FROM orders");
    mem = null;
    bumpStore("order");
    refreshSite();
    return;
  }
  const store = await currentStore(true);
  store.orders = [];
  await commit(store);
  bumpStore("order");
  refreshSite();
}

/** Delete a single order by id. */
export async function deleteOrder(id: string) {
  if (TURSO_ON) {
    await ensureSchema();
    await db().execute({ sql: "DELETE FROM orders WHERE id = ?", args: [id] });
    mem = null;
    bumpStore("order");
    refreshSite();
    return;
  }
  const store = await currentStore(true);
  store.orders = store.orders.filter((o) => o.id !== id);
  await commit(store);
  bumpStore("order");
  refreshSite();
}

/** Apply a change to a single order (status, payment, notes, archive…). */
export async function updateOrder(id: string, mutate: (o: Order) => Order): Promise<Order | null> {
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({ sql: "SELECT data FROM orders WHERE id = ?", args: [id] });
    if (!res.rows[0]) return null;
    const updated = mutate(normalizeOrder(JSON.parse(String(res.rows[0].data)) as Order));
    await db().execute({
      sql: `UPDATE orders SET status = ?, payment_status = ?, total = ?, archived = ?, data = ? WHERE id = ?`,
      args: [updated.status, updated.paymentStatus, updated.total, updated.archived ? 1 : 0, JSON.stringify(updated), id],
    });
    mem = null;
    bumpStore("order");
    refreshSite();
    return updated;
  }
  const store = await currentStore(true);
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated = mutate(normalizeOrder(store.orders[idx]));
  store.orders[idx] = updated;
  await commit(store);
  bumpStore("order");
  refreshSite();
  return updated;
}

/** Look up a single order by its number — an indexed query, used by tracking. */
export async function findOrderByNumber(needle: string): Promise<Order | null> {
  const bare = needle.trim().toUpperCase().replace(/^#/, "");
  if (!bare) return null;
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({
      sql: `SELECT data FROM orders WHERE UPPER(REPLACE(number,'#','')) = ? OR UPPER(id) = ? LIMIT 1`,
      args: [bare, bare],
    });
    return res.rows[0] ? normalizeOrder(JSON.parse(String(res.rows[0].data)) as Order) : null;
  }
  const orders = await getOrders();
  return orders.find((o) => o.number.toUpperCase().replace(/^#/, "") === bare || o.id.toUpperCase() === bare) ?? null;
}

/** All orders for a phone or email — lets shoppers find orders across devices. */
export async function findOrdersByContact(contact: string): Promise<Order[]> {
  const v = contact.trim().toLowerCase();
  if (!v) return [];
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({
      sql: `SELECT data FROM orders
            WHERE LOWER(customer_email) = ? OR REPLACE(REPLACE(customer_phone,' ',''),'+','') = ?
            ORDER BY created_at DESC LIMIT 50`,
      args: [v, v.replace(/[\s+]/g, "")],
    });
    return res.rows.map((r) => normalizeOrder(JSON.parse(String(r.data)) as Order));
  }
  const digits = v.replace(/[\s+]/g, "");
  return (await getOrders()).filter(
    (o) => o.customer.email?.toLowerCase() === v || (o.customer.phone ?? "").replace(/[\s+]/g, "") === digits,
  );
}

/** Orders placed while signed in to this customer account. */
export async function findOrdersByUser(userId: string): Promise<Order[]> {
  if (!userId) return [];
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({
      sql: `SELECT data FROM orders WHERE json_extract(data, '$.userId') = ? ORDER BY created_at DESC LIMIT 100`,
      args: [userId],
    });
    return res.rows.map((r) => normalizeOrder(JSON.parse(String(r.data)) as Order));
  }
  return (await getOrders()).filter((o) => o.userId === userId);
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

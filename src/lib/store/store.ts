import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CategorySlug, Product, StoreData } from "@/lib/types";
import { seed } from "./seed";

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
    // guard against partial files
    return {
      products: raw.products ?? seed.products,
      categories: raw.categories ?? seed.categories,
      settings: { ...seed.settings, ...raw.settings },
    };
  } catch {
    return seed;
  }
}

export function writeStore(data: StoreData) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
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

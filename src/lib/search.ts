import type { Category, Product } from "@/lib/types";

/**
 * Store search + recommendations (pure functions — used in the browser and on
 * the server).
 *
 * Search ranks every product by relevance: exact words beat prefixes beat
 * partial matches, the product name counts most, then its category, tagline,
 * brand, features and specs. Everyday words map to our categories ("earphones",
 * "airpods", "powerbank", "cctv"…), small typos are tolerated ("earbds"), and
 * popular / in-stock items get a light boost so the best match is first.
 */

const SYNONYMS: Record<string, string[]> = {
  earbuds: ["earbud", "buds", "earphone", "earphones", "airpods", "tws", "headset", "wireless earbuds", "ear"],
  headphones: ["headphone", "headset", "gaming headset", "over ear", "neckband", "necklace"],
  smartwatches: ["smartwatch", "watch", "watches", "fitness", "band", "tracker"],
  "power-banks": ["powerbank", "power bank", "battery", "portable charger", "mah"],
  chargers: ["charger", "adapter", "plug", "wall charger", "fast charger", "gan", "car charger", "wireless charger"],
  cables: ["cable", "cord", "usb", "type c", "type-c", "lightning", "micro usb", "data cable"],
  speakers: ["speaker", "sound", "bluetooth speaker", "boombox", "music", "audio"],
  "home-appliances": ["appliance", "iron", "vacuum", "fan", "hair dryer", "toothbrush", "kettle", "home"],
  computing: ["computer", "pc", "laptop", "mouse", "keyboard", "hub", "vga", "hdmi"],
  cameras: ["camera", "cctv", "security", "ip camera", "surveillance", "webcam"],
  accessories: ["accessory", "phone accessories", "holder", "case"],
};

/** Categories that go well together (for "Complete your setup"). */
const COMPLEMENTS: Record<string, string[]> = {
  earbuds: ["chargers", "cables", "power-banks"],
  smartwatches: ["chargers", "earbuds", "power-banks"],
  "power-banks": ["cables", "chargers", "earbuds"],
  chargers: ["cables", "power-banks", "earbuds"],
  cables: ["chargers", "power-banks", "computing"],
  speakers: ["power-banks", "cables", "earbuds"],
  "home-appliances": ["accessories", "chargers"],
  computing: ["cables", "accessories", "chargers"],
  cameras: ["cables", "power-banks", "computing"],
  accessories: ["chargers", "cables", "earbuds"],
};

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.+]+/g, " ")
    .trim();
}

const words = (s: string) => normalize(s).split(" ").filter(Boolean);

/** Levenshtein distance with an early exit once it exceeds `max`. */
function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** How well one query word matches a list of field words (0–1). */
function wordScore(q: string, fieldWords: string[], fieldText: string) {
  let best = 0;
  for (const w of fieldWords) {
    if (w === q) return 1;
    if (w.startsWith(q) && q.length >= 2) best = Math.max(best, 0.8);
    else if (q.length >= 4 && w.includes(q)) best = Math.max(best, 0.55);
    else if (q.length >= 4 && w.length >= 4) {
      const d = editDistance(q, w, q.length >= 7 ? 2 : 1);
      if (d <= (q.length >= 7 ? 2 : 1)) best = Math.max(best, 0.5);
    }
  }
  if (!best && q.length >= 3 && fieldText.includes(q)) best = 0.4;
  return best;
}

interface Indexed {
  product: Product;
  fields: { words: string[]; text: string; weight: number }[];
}

const FIELD_WEIGHTS = { name: 10, category: 6, tagline: 4, brand: 3, features: 2, specs: 1, description: 0.6 };

function index(products: Product[], categories: Category[]): Indexed[] {
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  return products.map((p) => {
    const category = `${catName[p.category] ?? p.category} ${p.category} ${(SYNONYMS[p.category] ?? []).join(" ")}`;
    const raw: [string, number][] = [
      [p.name, FIELD_WEIGHTS.name],
      [category, FIELD_WEIGHTS.category],
      [p.tagline, FIELD_WEIGHTS.tagline],
      [p.brand ?? "", FIELD_WEIGHTS.brand],
      [(p.features ?? []).join(" "), FIELD_WEIGHTS.features],
      [Object.entries(p.specs ?? {}).map(([k, v]) => `${k} ${v}`).join(" "), FIELD_WEIGHTS.specs],
      [p.description ?? "", FIELD_WEIGHTS.description],
    ];
    return { product: p, fields: raw.map(([t, weight]) => ({ words: words(t), text: normalize(t), weight })) };
  });
}

/** Expand the query with category synonyms ("earphones" → earbuds…). */
function expand(query: string): { terms: string[]; categories: string[] } {
  const q = normalize(query);
  const categories = new Set<string>();
  for (const [slug, syns] of Object.entries(SYNONYMS)) {
    if ([slug.replace("-", " "), ...syns].some((s) => q === s || q.includes(s) || (s.length >= 4 && s.startsWith(q) && q.length >= 3))) {
      categories.add(slug);
    }
  }
  return { terms: words(query), categories: [...categories] };
}

export interface SearchResult {
  products: Product[];
  /** categories the shopper probably means, best first */
  categories: string[];
}

export function searchProducts(query: string, products: Product[], categories: Category[], limit = 60): SearchResult {
  const { terms, categories: impliedCats } = expand(query);
  if (terms.length === 0) return { products: [], categories: [] };
  const idx = index(products, categories);

  const scored = idx.map(({ product, fields }) => {
    let total = 0;
    let matched = 0;
    for (const t of terms) {
      let best = 0;
      for (const f of fields) best = Math.max(best, wordScore(t, f.words, f.text) * f.weight);
      if (best > 0) matched++;
      total += best;
    }
    if (impliedCats.includes(product.category)) total += 5;
    // everything the shopper typed matched → strong bonus; partial matches rank lower
    const coverage = matched / terms.length;
    total *= coverage === 1 ? 1.5 : coverage;
    if (total > 0) {
      total += (product.soldPercent ?? 0) / 50 + product.rating / 5;
      if (!product.inStock) total *= 0.6;
    }
    return { product, total };
  });

  const ranked = scored.filter((s) => s.total > 1).sort((a, b) => b.total - a.total);

  // Category suggestions: implied by the words, or where the top results live.
  const catCount = new Map<string, number>();
  for (const c of impliedCats) catCount.set(c, 100);
  for (const r of ranked.slice(0, 12)) catCount.set(r.product.category, (catCount.get(r.product.category) ?? 0) + 1);
  const cats = [...catCount.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 4);

  return { products: ranked.slice(0, limit).map((r) => r.product), categories: cats };
}

/** Similar products: same kind of item, similar price, shared features, same brand. */
export function similarProducts(product: Product, all: Product[], limit = 8): Product[] {
  const feat = new Set(words((product.features ?? []).join(" ") + " " + product.tagline).filter((w) => w.length > 3));
  return all
    .filter((p) => p.slug !== product.slug)
    .map((p) => {
      let s = 0;
      if (p.category === product.category) s += 6;
      const other = words((p.features ?? []).join(" ") + " " + p.tagline).filter((w) => w.length > 3);
      const shared = other.filter((w) => feat.has(w)).length;
      s += Math.min(3, shared * 0.6);
      const priceGap = Math.abs(p.price - product.price) / Math.max(p.price, product.price);
      s += 2 * (1 - priceGap);
      if (p.brand && p.brand === product.brand) s += 0.5;
      if (p.inStock) s += 0.5;
      s += p.rating * 0.2 + (p.soldPercent ?? 0) / 100;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Items from other categories that go with this one ("Complete your setup"). */
export function complementaryProducts(product: Product, all: Product[], limit = 4): Product[] {
  const wanted = COMPLEMENTS[product.category] ?? [];
  const picks: Product[] = [];
  for (const cat of wanted) {
    const best = all
      .filter((p) => p.category === cat && p.inStock && !picks.includes(p))
      .sort((a, b) => (b.soldPercent ?? 0) + b.rating * 10 - ((a.soldPercent ?? 0) + a.rating * 10));
    picks.push(...best.slice(0, wanted.length >= 3 ? 2 : 3));
  }
  return picks.slice(0, limit);
}

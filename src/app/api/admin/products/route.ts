import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { isSafeMediaUrl, parseVideo } from "@/lib/media";
import { logActivity } from "@/lib/store/activity";

/** Keep only safe media URLs (same-site paths or https), max 12 extra photos. */
function cleanMedia(body: Partial<Product>) {
  const image = isSafeMediaUrl(body.image) ? body.image : null;
  const images = Array.isArray(body.images) ? body.images.filter(isSafeMediaUrl).filter((u) => u !== image).slice(0, 12) : [];
  const video = body.video && parseVideo(body.video) ? body.video : null;
  return { image, images, video };
}

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json((await readStore()).products);
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as Partial<Product>;
  const store = (await readStore());
  let slug = slugify(body.name ?? "new-product");
  if (!slug) slug = `product-${Date.now()}`;
  // ensure unique
  let unique = slug, n = 1;
  while (store.products.some((p) => p.slug === unique)) unique = `${slug}-${++n}`;

  const product: Product = {
    id: unique,
    slug: unique,
    name: body.name ?? "New product",
    tagline: body.tagline ?? "",
    category: body.category ?? "accessories",
    price: Number(body.price) || 0,
    compareAt: body.compareAt ? Number(body.compareAt) : undefined,
    rating: body.rating ?? 4.5,
    reviewCount: body.reviewCount ?? 0,
    accent: body.accent ?? "#FFB703",
    colors: body.colors?.length ? body.colors : ["#131A2A", "#F5F5F5"],
    badges: body.badges ?? [],
    features: body.features ?? [],
    specs: body.specs ?? {},
    inStock: body.inStock ?? true,
    stock: Number.isFinite(Number(body.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : undefined,
    soldPercent: body.soldPercent ?? 0,
    description: body.description ?? "",
    ...cleanMedia(body),
  };
  store.products.unshift(product);
  await writeStore(store);
  await logActivity("admin", "info", `Product added: ${product.name} (Ksh ${product.price.toLocaleString("en-KE")})`, { ref: product.slug, req });
  return NextResponse.json(product);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json()) as Product;
  const store = (await readStore());
  const idx = store.products.findIndex((p) => p.slug === body.slug);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.products[idx] = {
    ...store.products[idx],
    ...body,
    price: Number(body.price) || 0,
    compareAt: body.compareAt ? Number(body.compareAt) : undefined,
    rating: Number(body.rating) || 0,
    ...cleanMedia(body),
  };
  await writeStore(store);
  const p = store.products[idx];
  await logActivity("admin", "info", `Product updated: ${p.name} — Ksh ${p.price.toLocaleString("en-KE")}${p.inStock === false ? " · out of stock" : typeof p.stock === "number" ? ` · ${p.stock} in stock` : ""}`, { ref: p.slug, req });
  return NextResponse.json(p);
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const slug = new URL(req.url).searchParams.get("slug");
  const store = (await readStore());
  const gone = store.products.find((p) => p.slug === slug);
  store.products = store.products.filter((p) => p.slug !== slug);
  await writeStore(store);
  if (gone) await logActivity("admin", "warning", `Product deleted: ${gone.name}`, { ref: gone.slug, req });
  return NextResponse.json({ ok: true });
}

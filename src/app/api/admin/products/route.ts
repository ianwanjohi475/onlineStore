import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";

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
    accent: body.accent ?? "#00E676",
    colors: body.colors?.length ? body.colors : ["#0B3D2E", "#F5F5F5"],
    badges: body.badges ?? [],
    features: body.features ?? [],
    specs: body.specs ?? {},
    inStock: body.inStock ?? true,
    soldPercent: body.soldPercent ?? 0,
    description: body.description ?? "",
    image: body.image ?? null,
  };
  store.products.unshift(product);
  await writeStore(store);
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
  };
  await writeStore(store);
  return NextResponse.json(store.products[idx]);
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const slug = new URL(req.url).searchParams.get("slug");
  const store = (await readStore());
  store.products = store.products.filter((p) => p.slug !== slug);
  await writeStore(store);
  return NextResponse.json({ ok: true });
}

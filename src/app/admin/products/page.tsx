"use client";

import { ImageOff, Loader2, Package, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Btn, Card, ConfirmDialog, Drawer, EmptyState, Field, PageHeader, Pagination,
  SearchInput, Select, StatusPill, TextArea, Toggle, api, usePaginated,
} from "@/components/admin/kit";
import { ProductImage } from "@/components/product/product-image";
import { useToast } from "@/context/toast";
import type { Brand, Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const BADGES = ["new", "bestseller", "sale", "limited"] as const;
type Sort = "recent" | "name" | "price-asc" | "price-desc" | "stock";

export default function ProductsAdmin() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const load = () => api("/api/admin/products", "GET").then(setProducts).catch(() => setProducts([]));
  useEffect(() => {
    load();
    api("/api/admin/categories", "GET").then(setCategories).catch(() => {});
    api("/api/admin/brands", "GET").then(setBrands).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = (products ?? []).filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      const q = query.toLowerCase();
      return !q || p.name.toLowerCase().includes(q);
    });
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      recent: () => 0, name: (a, b) => a.name.localeCompare(b.name),
      "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price,
      stock: (a, b) => (a.stock ?? 0) - (b.stock ?? 0),
    };
    return [...list].sort(by[sort]);
  }, [products, query, cat, sort]);

  const { slice, page, pages, setPage } = usePaginated(filtered, 10);

  const del = async (slug: string) => { await api(`/api/admin/products?slug=${slug}`, "DELETE"); toast("Product deleted"); load(); };
  const bulkDelete = async () => {
    await Promise.all([...selected].map((s) => api(`/api/admin/products?slug=${s}`, "DELETE")));
    toast(`${selected.size} products deleted`); setSelected(new Set()); load();
  };
  const toggleSel = (slug: string) => setSelected((s) => { const n = new Set(s); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={products ? `${products.length} products` : "Loading…"}
        actions={<Btn onClick={() => setEditing("new")}><Plus size={16} /> Add product</Btn>}
      />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search products" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500">
          <option value="recent">Newest</option><option value="name">Name A–Z</option>
          <option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option><option value="stock">Low stock</option>
        </select>
        {selected.size > 0 && <Btn variant="danger" size="sm" className="ml-auto" onClick={() => setBulkConfirm(true)}><Trash2 size={14} /> Delete {selected.size}</Btn>}
      </Card>

      <Card>
        {products === null ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-2" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products" desc="Add your first product to get started." action={<Btn onClick={() => setEditing("new")}><Plus size={16} /> Add product</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="w-10 px-4 py-3"><input type="checkbox" className="size-4 accent-brand-500" checked={slice.every((p) => selected.has(p.slug)) && slice.length > 0} onChange={(e) => setSelected((s) => { const n = new Set(s); slice.forEach((p) => e.target.checked ? n.add(p.slug) : n.delete(p.slug)); return n; })} /></th>
                  <th className="px-3 py-3 font-semibold">Product</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((p) => (
                  <tr key={p.slug} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><input type="checkbox" className="size-4 accent-brand-500" checked={selected.has(p.slug)} onChange={() => toggleSel(p.slug)} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage product={p} glow={false} className="size-11 shrink-0 rounded-lg" sizes="44px" />
                        <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="truncate text-xs text-muted capitalize">{p.brand ?? "—"}</p></div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 capitalize text-muted md:table-cell">{p.category}</td>
                    <td className="px-5 py-3"><span className="font-semibold">{formatPrice(p.price)}</span>{p.compareAt && <span className="ml-1 text-xs text-muted line-through">{formatPrice(p.compareAt)}</span>}</td>
                    <td className="px-5 py-3"><span className={`font-semibold tabular-nums ${(p.stock ?? 0) === 0 ? "text-rose-500" : (p.stock ?? 0) <= 5 ? "text-amber-600" : ""}`}>{p.stock ?? 0}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(p)} aria-label="Edit" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"><Pencil size={16} /></button>
                        <button onClick={() => setConfirm(p.slug)} aria-label="Delete" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-rose-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-border p-4"><Pagination page={page} pages={pages} setPage={setPage} total={filtered.length} /></div>
          </div>
        )}
      </Card>

      {editing && <ProductEditor product={editing === "new" ? null : editing} categories={categories} brands={brands} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      <ConfirmDialog open={!!confirm} title="Delete product?" desc="This can't be undone." onConfirm={() => confirm && del(confirm)} onClose={() => setConfirm(null)} />
      <ConfirmDialog open={bulkConfirm} title={`Delete ${selected.size} products?`} desc="This can't be undone." onConfirm={bulkDelete} onClose={() => setBulkConfirm(false)} />
    </div>
  );
}

function ProductEditor({ product, categories, brands, onClose, onSaved }: { product: Product | null; categories: Category[]; brands: Brand[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState<Partial<Product>>(product ?? {
    name: "", tagline: "", category: categories[0]?.slug ?? "accessories", brand: brands[0]?.slug,
    price: 0, rating: 4.5, reviewCount: 0, inStock: true, stock: 20, badges: [], colors: ["#0B3D2E", "#F5F5F5"],
    features: [], specs: {}, description: "", image: null, accent: "#00E676",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF((p) => ({ ...p, [k]: v }));
  const preview = { ...(product ?? {}), ...f } as Product;

  const save = async () => {
    if (!f.name?.trim()) { toast("Enter a product name", "info"); return; }
    setSaving(true);
    try {
      await api("/api/admin/products", product ? "PUT" : "POST", { ...f, inStock: (f.stock ?? 0) > 0 });
      toast(product ? "Product updated" : "Product added"); onSaved();
    } catch { toast("Could not save", "info"); setSaving(false); }
  };

  return (
    <Drawer open title={product ? "Edit product" : "Add product"} onClose={onClose}
      footer={<div className="flex gap-3"><Btn variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn><Btn className="flex-1" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Btn></div>}>
      <div className="flex flex-col gap-4">
        <ImageUploader preview={preview} value={f.image ?? null} onChange={(url) => set("image", url)} />
        <Field label="Product name" value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        <Field label="Tagline" value={f.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={f.category} onChange={(e) => set("category", e.target.value as Product["category"])}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
          <Select label="Brand" value={f.brand ?? ""} onChange={(e) => set("brand", e.target.value)}>{brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</Select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Price" type="number" value={f.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
          <Field label="Compare-at" type="number" value={f.compareAt ?? ""} onChange={(e) => set("compareAt", e.target.value ? Number(e.target.value) : undefined)} />
          <Field label="Stock" type="number" value={f.stock ?? 0} onChange={(e) => set("stock", Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rating" type="number" step="0.1" value={f.rating ?? 4.5} onChange={(e) => set("rating", Number(e.target.value))} />
          <Field label="Reviews" type="number" value={f.reviewCount ?? 0} onChange={(e) => set("reviewCount", Number(e.target.value))} />
        </div>
        <div>
          <span className="text-sm font-medium">Tags</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {BADGES.map((b) => {
              const on = f.badges?.includes(b);
              return <button key={b} type="button" onClick={() => set("badges", on ? (f.badges ?? []).filter((x) => x !== b) : [...(f.badges ?? []), b])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${on ? "border-brand-500 bg-brand-500/12 text-brand-700 dark:text-brand-300" : "border-border text-muted"}`}>{b}</button>;
            })}
          </div>
        </div>
        <TextArea label="Description" rows={4} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        <TextArea label="Key features (one per line)" rows={3} value={(f.features ?? []).join("\n")} onChange={(e) => set("features", e.target.value.split("\n").filter(Boolean))} />
      </div>
    </Drawer>
  );
}

function ImageUploader({ preview, value, onChange }: { preview: Product; value: string | null; onChange: (url: string | null) => void }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file", "info"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Image must be 5MB or smaller", "info"); return; }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      toast("Photo uploaded");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "info");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <ProductImage product={preview} glow={false} className="size-24 rounded-xl border border-border" sizes="96px" />
          {value && (
            <button type="button" onClick={() => onChange(null)} aria-label="Remove photo"
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-rose-500 text-white shadow"><ImageOff size={13} /></button>
          )}
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const file = e.dataTransfer.files?.[0]; if (file) upload(file); }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-4 text-center transition-colors ${drag ? "border-brand-500 bg-brand-500/5" : "border-border hover:border-brand-500/60"}`}
        >
          {uploading ? <Loader2 size={20} className="animate-spin text-brand-500" /> : <Upload size={20} className="text-muted" />}
          <p className="text-sm font-medium">{uploading ? "Uploading…" : "Upload photo"}</p>
          <p className="text-xs text-muted">Drag & drop or click · PNG/JPG up to 5MB</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = ""; }} />
      <Field label="Or paste an image URL" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="https://…  or  /uploads/photo.jpg" />
    </div>
  );
}

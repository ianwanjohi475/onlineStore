"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminCard, Field, HelpNote, Select, TextArea, Toggle, api } from "@/components/admin/kit";
import { ProductImage } from "@/components/product/product-image";
import { useToast } from "@/context/toast";
import type { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const BADGES = ["new", "bestseller", "sale", "limited"] as const;

export default function ProductsAdmin() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const load = () => api("/api/admin/products", "GET").then(setProducts).catch(() => {});
  useEffect(() => {
    load();
    api("/api/admin/categories", "GET").then(setCategories).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const del = async (slug: string) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await api(`/api/admin/products?slug=${slug}`, "DELETE");
    toast("Product deleted");
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-muted">{products.length} items in your store</p>
        </div>
        <button onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-brand-950 hover:bg-brand-400">
          <Plus size={17} /> Add product
        </button>
      </div>

      <HelpNote>
        Click <b>Edit</b> to change a product&apos;s name, price, photo or stock. Set a
        <b> &ldquo;Compare-at price&rdquo;</b> higher than the price to show a discount badge. Add the
        <b> &ldquo;bestseller&rdquo;</b> or <b>&ldquo;new&rdquo;</b> tag to feature it in those homepage rows.
      </HelpNote>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="h-10 w-full max-w-sm rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
      />

      <div className="overflow-hidden rounded-2xl border border-border">
        {filtered.map((p) => (
          <div key={p.slug} className="flex items-center gap-4 border-b border-border bg-surface p-3 last:border-0">
            <ProductImage product={p} glow={false} className="size-14 shrink-0 rounded-xl" sizes="56px" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.name}</p>
              <p className="truncate text-xs text-muted">{p.category} · {p.inStock ? "In stock" : "Out of stock"}</p>
            </div>
            <div className="hidden items-baseline gap-2 sm:flex">
              <span className="font-semibold">{formatPrice(p.price)}</span>
              {p.compareAt && <span className="text-xs text-muted line-through">{formatPrice(p.compareAt)}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setEditing(p)} aria-label="Edit" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"><Pencil size={16} /></button>
              <button onClick={() => del(p.slug)} aria-label="Delete" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="bg-surface p-8 text-center text-sm text-muted">No products found.</p>}
      </div>

      {editing && (
        <ProductEditor
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      name: "", tagline: "", category: (categories[0]?.slug ?? "accessories"),
      price: 0, rating: 4.5, inStock: true, badges: [], colors: ["#0B3D2E", "#F5F5F5"],
      features: [], specs: {}, description: "", image: null,
    },
  );
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name?.trim()) { toast("Please enter a product name", "info"); return; }
    setSaving(true);
    try {
      await api("/api/admin/products", product ? "PUT" : "POST", form);
      toast(product ? "Product updated" : "Product added");
      onSaved();
    } catch {
      toast("Could not save", "info");
      setSaving(false);
    }
  };

  const previewProduct = { ...(product ?? {}), ...form } as Product;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <h2 className="font-display text-lg font-bold">{product ? "Edit product" : "Add product"}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-4 rounded-xl border border-border p-3">
            <ProductImage product={previewProduct} glow={false} className="size-20 shrink-0 rounded-xl" sizes="80px" />
            <p className="text-xs text-muted">Live preview. Paste an image URL below, or leave it blank to use the built-in graphic.</p>
          </div>

          <Field label="Product name" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          <Field label="Short tagline" hint="Small text shown under the name" value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          <Field label="Image URL" hint="Any public image link (https://…). Blank = generated graphic." value={form.image ?? ""} onChange={(e) => set("image", e.target.value || null)} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value as Product["category"])}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </Select>
            <Field label="Accent colour" hint="Hex, e.g. #00E676" value={form.accent ?? "#00E676"} onChange={(e) => set("accent", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (KES)" type="number" value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
            <Field label="Compare-at price" hint="Higher than price = shows a discount" type="number" value={form.compareAt ?? ""} onChange={(e) => set("compareAt", e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating (0–5)" type="number" step="0.1" value={form.rating ?? 4.5} onChange={(e) => set("rating", Number(e.target.value))} />
            <Field label="Review count" type="number" value={form.reviewCount ?? 0} onChange={(e) => set("reviewCount", Number(e.target.value))} />
          </div>

          <div>
            <span className="text-sm font-medium">Tags</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const on = form.badges?.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("badges", on ? (form.badges ?? []).filter((x) => x !== b) : [...(form.badges ?? []), b])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${on ? "border-brand-500 bg-brand-500/12 text-brand-700 dark:text-brand-300" : "border-border text-muted"}`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <Toggle label="In stock" checked={form.inStock ?? true} onChange={(v) => set("inStock", v)} />

          <TextArea label="Description" rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          <TextArea
            label="Key features"
            hint="One per line"
            rows={3}
            value={(form.features ?? []).join("\n")}
            onChange={(e) => set("features", e.target.value.split("\n").filter(Boolean))}
          />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-surface px-5 py-4">
          <button onClick={onClose} className="h-11 flex-1 rounded-full border border-border font-semibold hover:bg-surface-2">Cancel</button>
          <button onClick={save} disabled={saving} className="h-11 flex-1 rounded-full bg-brand-500 font-semibold text-brand-950 hover:bg-brand-400 disabled:opacity-60">
            {saving ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

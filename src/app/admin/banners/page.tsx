"use client";

import { Copy, GripVertical, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Btn, Card, ConfirmDialog, Drawer, EmptyState, Field, PageHeader, Select,
  StatusPill, TextArea, Toggle, api,
} from "@/components/admin/kit";
import { ProductImage } from "@/components/product/product-image";
import { PosterSlide } from "@/components/market/poster-slide";
import { useToast } from "@/context/toast";
import type { HeroSlide, Product, SiteSettings } from "@/lib/types";

function blankSlide(slug: string): HeroSlide {
  return {
    id: `slide-${Date.now()}`, slug, eyebrow: "New", title: "New banner", subtitle: "",
    copy: "Describe the offer", buttonText: "Shop now", buttonLink: `/product/${slug}`,
    from: "#ffe2c9", to: "#ea580c", overlay: 0, active: true,
  };
}

export default function BannersAdmin() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/settings", "GET").then(setSettings).catch(() => {});
    api("/api/admin/products", "GET").then(setProducts).catch(() => {});
  }, []);

  if (!settings) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;
  const slides = settings.heroSlides;
  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));

  const persist = async (next: HeroSlide[]) => {
    setSettings({ ...settings, heroSlides: next });
    setSaving(true);
    try { await api("/api/admin/settings", "PUT", { heroSlides: next }); }
    catch { toast("Could not save", "info"); }
    setSaving(false);
  };

  const upsert = (slide: HeroSlide) => {
    const exists = slides.some((s) => s.id === slide.id);
    persist(exists ? slides.map((s) => (s.id === slide.id ? slide : s)) : [...slides, slide]);
    toast(exists ? "Banner updated" : "Banner created");
    setEditing(null);
  };
  const remove = (id: string) => { persist(slides.filter((s) => s.id !== id)); toast("Banner deleted"); };
  const duplicate = (s: HeroSlide) => { persist([...slides, { ...s, id: `slide-${Date.now()}`, title: `${s.title} (copy)` }]); toast("Banner duplicated"); };
  const toggleActive = (s: HeroSlide) => persist(slides.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));

  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...slides];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setDragIdx(null);
    persist(next);
  };

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="The rotating hero on your homepage. Drag to reorder; changes publish live."
        actions={<Btn onClick={() => setEditing(blankSlide(products[0]?.slug ?? ""))}><Plus size={16} /> New banner</Btn>}
      />
      {saving && <p className="mb-3 text-xs text-muted">Saving…</p>}

      {slides.length === 0 ? (
        <Card><EmptyState icon={ImageIcon} title="No banners yet" desc="Create your first homepage hero banner." action={<Btn onClick={() => setEditing(blankSlide(products[0]?.slug ?? ""))}><Plus size={16} /> New banner</Btn>} /></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {slides.map((s, i) => (
            <Card
              key={s.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`flex flex-wrap items-stretch gap-x-4 overflow-hidden p-0 transition-shadow sm:flex-nowrap ${dragIdx === i ? "opacity-50" : ""}`}
            >
              <div className="flex cursor-grab items-center px-2 text-muted"><GripVertical size={18} /></div>
              {/* mini preview */}
              <div className="relative my-3 hidden w-40 shrink-0 grid-cols-2 overflow-hidden rounded-xl sm:grid" style={{ background: s.from, borderTop: `6px solid ${s.to}` }}>
                <div className="flex flex-col justify-center p-2 text-[0.5rem] leading-tight text-[#111]">
                  <span className="opacity-70">{s.eyebrow}</span>
                  <span className="font-bold">{s.title}</span>
                </div>
                {productMap[s.slug] && <ProductImage product={productMap[s.slug]} glow={false} className="!bg-transparent" sizes="80px" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3 sm:pr-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.title}</p>
                  <StatusPill status={s.active ? "active" : "hidden"} />
                </div>
                <p className="line-clamp-2 text-sm text-muted">{s.copy}</p>
                <p className="mt-1 text-xs text-muted">Product: {productMap[s.slug]?.name ?? s.slug}{s.startDate ? ` · from ${s.startDate}` : ""}{s.endDate ? ` · until ${s.endDate}` : ""}</p>
              </div>
              <div className="flex w-full items-center justify-end gap-1 border-t border-border px-3 py-1.5 sm:w-auto sm:border-0 sm:py-0 sm:pl-0">
                <Toggle checked={s.active} onChange={() => toggleActive(s)} />
                <button onClick={() => setEditing(s)} aria-label="Edit" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"><Pencil size={16} /></button>
                <button onClick={() => duplicate(s)} aria-label="Duplicate" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"><Copy size={16} /></button>
                <button onClick={() => setConfirm(s.id)} aria-label="Delete" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <BannerEditor slide={editing} products={products} onSave={upsert} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!confirm} title="Delete this banner?" desc="It will be removed from the homepage." onConfirm={() => confirm && remove(confirm)} onClose={() => setConfirm(null)} />
    </div>
  );
}

function BannerEditor({ slide, products, onSave, onClose }: { slide: HeroSlide; products: Product[]; onSave: (s: HeroSlide) => void; onClose: () => void }) {
  const [f, setF] = useState<HeroSlide>(slide);
  const set = <K extends keyof HeroSlide>(k: K, v: HeroSlide[K]) => setF((p) => ({ ...p, [k]: v }));
  const product = products.find((p) => p.slug === f.slug);

  return (
    <Drawer
      open
      title={slide.title === "New banner" ? "New banner" : "Edit banner"}
      onClose={onClose}
      footer={<div className="flex gap-3"><Btn variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn><Btn className="flex-1" onClick={() => onSave(f)}>Publish</Btn></div>}
    >
      {/* live preview */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Live preview</p>
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-border">
          {product ? <PosterSlide slide={f} product={product} compact /> : <div className="grid h-full place-items-center text-xs text-muted">Pick a product</div>}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Select label="Featured product" value={f.slug} onChange={(e) => set("slug", e.target.value)}>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </Select>
        <Field label="Ribbon text" hint="Scrolls along the top" value={f.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        <Field label="Big headline" hint="Short — 1 to 3 words" value={f.title} onChange={(e) => set("title", e.target.value)} />
        <Field label="Black caption" value={f.headline ?? ""} onChange={(e) => set("headline", e.target.value)} />
        <TextArea label="Description" rows={2} value={f.copy} onChange={(e) => set("copy", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Button text" value={f.buttonText} onChange={(e) => set("buttonText", e.target.value)} />
          <Field label="Button link" value={f.buttonLink} onChange={(e) => set("buttonLink", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ColorField label="Background colour" value={f.from} onChange={(v) => set("from", v)} />
          <ColorField label="Ribbon colour" value={f.to} onChange={(v) => set("to", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" type="date" value={f.startDate ?? ""} onChange={(e) => set("startDate", e.target.value || undefined)} />
          <Field label="End date" type="date" value={f.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || undefined)} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="text-xs text-muted">Show this banner on the storefront</p>
          </div>
          <Toggle checked={f.active} onChange={(v) => set("active", v)} />
        </div>
      </div>
    </Drawer>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="size-7 cursor-pointer rounded border-0 bg-transparent p-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </span>
    </label>
  );
}

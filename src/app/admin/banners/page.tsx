"use client";

import { Copy, GripVertical, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Btn, Card, ConfirmDialog, Drawer, EmptyState, Field, PageHeader, Select,
  StatusPill, TextArea, Toggle, api,
} from "@/components/admin/kit";
import { ProductImage } from "@/components/product/product-image";
import { useToast } from "@/context/toast";
import type { HeroSlide, Product, SiteSettings } from "@/lib/types";

function blankSlide(slug: string): HeroSlide {
  return {
    id: `slide-${Date.now()}`, slug, eyebrow: "New", title: "New banner", subtitle: "",
    copy: "Describe the offer", buttonText: "Shop now", buttonLink: `/product/${slug}`,
    from: "#0b3d2e", to: "#022018", overlay: 0, active: true,
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
              className={`flex items-stretch gap-4 overflow-hidden p-0 transition-shadow ${dragIdx === i ? "opacity-50" : ""}`}
            >
              <div className="flex cursor-grab items-center px-2 text-muted"><GripVertical size={18} /></div>
              {/* mini preview */}
              <div className="relative my-3 grid w-40 shrink-0 grid-cols-2 overflow-hidden rounded-xl" style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to})` }}>
                <div className="flex flex-col justify-center p-2 text-[0.5rem] leading-tight text-white">
                  <span className="opacity-70">{s.eyebrow}</span>
                  <span className="font-bold">{s.title}</span>
                </div>
                {productMap[s.slug] && <ProductImage product={productMap[s.slug]} glow={false} className="!bg-transparent" sizes="80px" />}
              </div>
              <div className="flex flex-1 flex-col justify-center py-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.title}</p>
                  <StatusPill status={s.active ? "active" : "hidden"} />
                </div>
                <p className="text-sm text-muted">{s.copy}</p>
                <p className="mt-1 text-xs text-muted">Product: {productMap[s.slug]?.name ?? s.slug}{s.startDate ? ` · from ${s.startDate}` : ""}{s.endDate ? ` · until ${s.endDate}` : ""}</p>
              </div>
              <div className="flex items-center gap-1 pr-3">
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
        <div className="relative grid aspect-[2.4/1] grid-cols-2 overflow-hidden rounded-xl" style={{ background: `linear-gradient(120deg, ${f.from}, ${f.to})` }}>
          <div className="relative z-10 flex flex-col justify-center gap-1 p-4 text-white">
            <span className="text-[0.65rem] opacity-80">{f.eyebrow}</span>
            <span className="font-display text-lg font-bold leading-tight">{f.title}</span>
            <span className="text-[0.7rem] opacity-80">{f.copy}</span>
            <span className="mt-1 w-fit rounded-full bg-brand-500 px-2.5 py-1 text-[0.65rem] font-bold text-brand-950">{f.buttonText}</span>
          </div>
          {product && <ProductImage product={product} glow={false} className="!bg-transparent" sizes="150px" />}
          {f.overlay > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: f.overlay / 100 }} />}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Select label="Featured product" value={f.slug} onChange={(e) => set("slug", e.target.value)}>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </Select>
        <Field label="Eyebrow" value={f.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        <Field label="Title" value={f.title} onChange={(e) => set("title", e.target.value)} />
        <Field label="Subtitle" value={f.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
        <TextArea label="Description" rows={2} value={f.copy} onChange={(e) => set("copy", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Button text" value={f.buttonText} onChange={(e) => set("buttonText", e.target.value)} />
          <Field label="Button link" value={f.buttonLink} onChange={(e) => set("buttonLink", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Background from" hint="Hex" value={f.from} onChange={(e) => set("from", e.target.value)} />
          <Field label="Background to" hint="Hex" value={f.to} onChange={(e) => set("to", e.target.value)} />
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Overlay darkness — {f.overlay}%</span>
          <input type="range" min={0} max={80} value={f.overlay} onChange={(e) => set("overlay", Number(e.target.value))} className="accent-brand-500" />
        </label>
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

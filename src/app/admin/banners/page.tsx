"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCard, Field, HelpNote, Select, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Announcement, HeroSlide, Product, SiteSettings } from "@/lib/types";

export default function BannersAdmin() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/settings", "GET").then(setSettings).catch(() => {});
    api("/api/admin/products", "GET").then(setProducts).catch(() => {});
  }, []);

  if (!settings) return <p className="text-muted">Loading…</p>;

  const setSlides = (heroSlides: HeroSlide[]) => setSettings({ ...settings, heroSlides });
  const setAnns = (announcements: Announcement[]) => setSettings({ ...settings, announcements });

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/admin/settings", "PUT", { heroSlides: settings.heroSlides, announcements: settings.announcements });
      toast("Banners saved — refresh the store to see them");
    } catch {
      toast("Could not save", "info");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Banners &amp; hero</h1>
          <p className="text-muted">Control the homepage carousel and the top announcement bar.</p>
        </div>
        <button onClick={save} disabled={saving} className="h-10 rounded-full bg-brand-500 px-6 text-sm font-semibold text-brand-950 hover:bg-brand-400 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <HelpNote>
        The <b>hero slides</b> are the big rotating banners at the top of the homepage — each one
        features a product. The <b>announcement bar</b> is the thin strip above the header. Add, edit
        or remove as many as you like, then press <b>Save changes</b>.
      </HelpNote>

      <AdminCard
        title="Hero slides"
        desc="The rotating homepage banner"
        action={
          <button
            onClick={() => setSlides([...settings.heroSlides, { slug: products[0]?.slug ?? "", eyebrow: "New", title: "New banner", copy: "Describe the offer", from: "#0b3d2e", to: "#022018" }])}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-brand-500"
          >
            <Plus size={15} /> Add slide
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          {settings.heroSlides.map((s, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Slide {i + 1}</span>
                <button onClick={() => setSlides(settings.heroSlides.filter((_, j) => j !== i))} className="text-muted hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Featured product" value={s.slug} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, slug: e.target.value } : x))}>
                  {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </Select>
                <Field label="Eyebrow (small label)" value={s.eyebrow} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, eyebrow: e.target.value } : x))} />
                <Field label="Title" value={s.title} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                <Field label="Subtext" value={s.copy} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, copy: e.target.value } : x))} />
                <Field label="Background from" hint="Hex colour" value={s.from} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, from: e.target.value } : x))} />
                <Field label="Background to" hint="Hex colour" value={s.to} onChange={(e) => setSlides(settings.heroSlides.map((x, j) => j === i ? { ...x, to: e.target.value } : x))} />
              </div>
            </div>
          ))}
          {settings.heroSlides.length === 0 && <p className="text-sm text-muted">No slides yet — add one above.</p>}
        </div>
      </AdminCard>

      <AdminCard
        title="Announcement bar"
        desc="The thin message strip at the very top"
        action={
          <button
            onClick={() => setAnns([...settings.announcements, { text: "New announcement", href: "/shop", cta: "Shop now" }])}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-brand-500"
          >
            <Plus size={15} /> Add message
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          {settings.announcements.map((a, i) => (
            <div key={i} className="grid items-end gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_10rem_8rem_auto]">
              <Field label="Message" value={a.text} onChange={(e) => setAnns(settings.announcements.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
              <Field label="Link" value={a.href} onChange={(e) => setAnns(settings.announcements.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
              <Field label="Button text" value={a.cta} onChange={(e) => setAnns(settings.announcements.map((x, j) => j === i ? { ...x, cta: e.target.value } : x))} />
              <button onClick={() => setAnns(settings.announcements.filter((_, j) => j !== i))} className="mb-1 grid size-10 place-items-center rounded-lg text-muted hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
          {settings.announcements.length === 0 && <p className="text-sm text-muted">No messages — add one above.</p>}
        </div>
      </AdminCard>
    </div>
  );
}

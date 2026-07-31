"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Btn, Card, Field, PageHeader, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Brand } from "@/lib/types";
import { slugify } from "@/lib/utils";

export default function BrandsAdmin() {
  const toast = useToast();
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/admin/brands", "GET").then(setBrands).catch(() => {}); }, []);
  if (!brands) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;

  const update = (i: number, patch: Partial<Brand>) => setBrands(brands.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const save = async () => {
    setSaving(true);
    const cleaned = brands.map((b) => ({ ...b, slug: b.slug || slugify(b.name) }));
    try { await api("/api/admin/brands", "PUT", cleaned); toast("Brands saved"); setBrands(cleaned); } catch { toast("Could not save", "info"); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Brands" subtitle="Manufacturers assigned to products" actions={
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => setBrands([...brands, { slug: "", name: "New brand", color: "#00E676" }])}><Plus size={16} /> Add</Btn>
          <Btn disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Btn>
        </div>
      } />
      <div className="flex flex-col gap-3">
        {brands.map((b, i) => (
          <Card key={i} className="grid items-end gap-4 p-4 sm:grid-cols-[1fr_1fr_5rem_auto]">
            <Field label="Name" value={b.name} onChange={(e) => update(i, { name: e.target.value })} />
            <Field label="Slug" hint="Auto from name if blank" value={b.slug} onChange={(e) => update(i, { slug: e.target.value })} />
            <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Colour</span><input type="color" value={b.color} onChange={(e) => update(i, { color: e.target.value })} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-background" /></label>
            <button onClick={() => setBrands(brands.filter((_, j) => j !== i))} className="mb-1 grid size-10 place-items-center rounded-lg text-muted hover:text-rose-500"><Trash2 size={16} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

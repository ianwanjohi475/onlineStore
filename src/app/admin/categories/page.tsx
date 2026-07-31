"use client";

import { useEffect, useState } from "react";
import { Btn, Card, Field, PageHeader, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Category } from "@/lib/types";

export default function CategoriesAdmin() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/admin/categories", "GET").then(setCategories).catch(() => {}); }, []);
  if (!categories) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;

  const update = (i: number, patch: Partial<Category>) => setCategories(categories.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const save = async () => { setSaving(true); try { await api("/api/admin/categories", "PUT", categories); toast("Categories saved"); } catch { toast("Could not save", "info"); } setSaving(false); };

  return (
    <div>
      <PageHeader title="Categories" subtitle="Groups shown in the menu and homepage" actions={<Btn disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</Btn>} />
      <div className="flex flex-col gap-3">
        {categories.map((c, i) => (
          <Card key={c.slug} className="grid items-end gap-4 p-4 sm:grid-cols-[7rem_1fr_1fr_5rem]">
            <div className="text-sm"><span className="font-medium">ID</span><p className="mt-1.5 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-muted">{c.slug}</p></div>
            <Field label="Name" value={c.name} onChange={(e) => update(i, { name: e.target.value })} />
            <Field label="Tagline" value={c.tagline} onChange={(e) => update(i, { tagline: e.target.value })} />
            <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Colour</span><input type="color" value={c.gradient[0]} onChange={(e) => update(i, { gradient: [e.target.value, c.gradient[1]] })} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-background" /></label>
          </Card>
        ))}
      </div>
    </div>
  );
}

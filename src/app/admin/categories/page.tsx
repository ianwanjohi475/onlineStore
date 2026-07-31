"use client";

import { useEffect, useState } from "react";
import { Field, HelpNote, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Category } from "@/lib/types";

export default function CategoriesAdmin() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/categories", "GET").then(setCategories).catch(() => {});
  }, []);

  if (!categories) return <p className="text-muted">Loading…</p>;

  const update = (i: number, patch: Partial<Category>) =>
    setCategories(categories.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/admin/categories", "PUT", categories);
      toast("Categories saved");
    } catch {
      toast("Could not save", "info");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-muted">The groups shown in the menu and homepage.</p>
        </div>
        <button onClick={save} disabled={saving} className="h-10 rounded-full bg-brand-500 px-6 text-sm font-semibold text-brand-950 hover:bg-brand-400 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <HelpNote>
        Rename a category or change its tagline and colours here. The <b>id</b> is fixed because your
        products are linked to it — changing the display name is always safe.
      </HelpNote>

      <div className="flex flex-col gap-3">
        {categories.map((c, i) => (
          <div key={c.slug} className="grid items-end gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[8rem_1fr_1fr_6rem]">
            <div className="text-sm">
              <span className="font-medium">ID</span>
              <p className="mt-2.5 rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-muted">{c.slug}</p>
            </div>
            <Field label="Name" value={c.name} onChange={(e) => update(i, { name: e.target.value })} />
            <Field label="Tagline" value={c.tagline} onChange={(e) => update(i, { tagline: e.target.value })} />
            <Field label="Colour" value={c.gradient[0]} onChange={(e) => update(i, { gradient: [e.target.value, c.gradient[1]] })} />
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Btn, Card, Field, PageHeader, Select, TextArea, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Testimonial } from "@/lib/types";

export default function TestimonialsAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/admin/testimonials", "GET").then(setItems).catch(() => {}); }, []);
  if (!items) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;

  const update = (i: number, patch: Partial<Testimonial>) => setItems(items.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const save = async () => { setSaving(true); try { await api("/api/admin/testimonials", "PUT", items); toast("Testimonials saved"); } catch { toast("Could not save", "info"); } setSaving(false); };
  const add = () => setItems([...items, { id: `t-${Date.now()}`, author: "New customer", role: "Verified buyer", rating: 5, quote: "", accent: "#00E676", avatar: "/people/a1.jpg" }]);

  return (
    <div>
      <PageHeader title="Testimonials" subtitle="Reviews shown on the homepage" actions={<div className="flex gap-2"><Btn variant="outline" onClick={add}><Plus size={16} /> Add</Btn><Btn disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Btn></div>} />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((t, i) => (
          <Card key={t.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-brand-500">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} className={s < t.rating ? "fill-brand-500" : "fill-transparent text-muted/40"} />)}</div>
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-muted hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
            <TextArea label="Quote" rows={3} value={t.quote} onChange={(e) => update(i, { quote: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author" value={t.author} onChange={(e) => update(i, { author: e.target.value })} />
              <Field label="Role" value={t.role} onChange={(e) => update(i, { role: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Rating" value={t.rating} onChange={(e) => update(i, { rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}</Select>
              <Select label="Avatar" value={t.avatar} onChange={(e) => update(i, { avatar: e.target.value })}>{["/people/a1.jpg", "/people/a2.jpg", "/people/a3.jpg", "/people/a4.jpg", "/people/a5.jpg", "/people/a6.jpg"].map((a) => <option key={a} value={a}>{a.split("/").pop()}</option>)}</Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

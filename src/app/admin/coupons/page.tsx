"use client";

import { BadgePercent, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Btn, Card, EmptyState, Field, PageHeader, Select, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { PromoCode, SiteSettings } from "@/lib/types";

export default function CouponsAdmin() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/admin/settings", "GET").then(setSettings).catch(() => {}); }, []);
  if (!settings) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;

  const promos = settings.promos;
  const setPromos = (p: PromoCode[]) => setSettings({ ...settings, promos: p });
  const save = async () => { setSaving(true); try { await api("/api/admin/settings", "PUT", { promos }); toast("Coupons saved"); } catch { toast("Could not save", "info"); } setSaving(false); };

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Discount codes customers enter at checkout" actions={<div className="flex gap-2"><Btn variant="outline" onClick={() => setPromos([...promos, { code: "NEWCODE", kind: "percent", value: 10, label: "10% off" }])}><Plus size={16} /> Add</Btn><Btn disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Btn></div>} />
      {promos.length === 0 ? (
        <Card><EmptyState icon={BadgePercent} title="No coupons yet" desc="Create a code customers can redeem." /></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {promos.map((p, i) => (
            <Card key={i} className="grid items-end gap-4 p-4 sm:grid-cols-[8rem_9rem_6rem_1fr_auto]">
              <Field label="Code" value={p.code} onChange={(e) => setPromos(promos.map((x, j) => j === i ? { ...x, code: e.target.value.toUpperCase() } : x))} />
              <Select label="Type" value={p.kind} onChange={(e) => setPromos(promos.map((x, j) => j === i ? { ...x, kind: e.target.value as PromoCode["kind"] } : x))}><option value="percent">% off</option><option value="ship">Free shipping</option></Select>
              <Field label="Value %" type="number" disabled={p.kind === "ship"} value={p.value ?? ""} onChange={(e) => setPromos(promos.map((x, j) => j === i ? { ...x, value: Number(e.target.value) } : x))} />
              <Field label="Label" value={p.label} onChange={(e) => setPromos(promos.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <button onClick={() => setPromos(promos.filter((_, j) => j !== i))} className="mb-1 grid size-10 place-items-center rounded-lg text-muted hover:text-rose-500"><Trash2 size={16} /></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

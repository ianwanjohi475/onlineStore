"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCard, Field, HelpNote, Select, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { PromoCode, SiteSettings } from "@/lib/types";

export default function SettingsAdmin() {
  const toast = useToast();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/settings", "GET").then(setS).catch(() => {});
  }, []);

  if (!s) return <p className="text-muted">Loading…</p>;

  const setPromos = (promos: PromoCode[]) => setS({ ...s, promos });

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/admin/settings", "PUT", s);
      toast("Settings saved");
    } catch {
      toast("Could not save", "info");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-muted">Brand, delivery, contact and promo codes.</p>
        </div>
        <button onClick={save} disabled={saving} className="h-10 rounded-full bg-brand-500 px-6 text-sm font-semibold text-brand-950 hover:bg-brand-400 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <HelpNote>
        These control store-wide values. <b>Free-shipping threshold</b> is the order total that unlocks
        free delivery; the <b>cart bar</b> and checkout update automatically. <b>WhatsApp number</b> powers
        the floating chat button (digits only, with country code).
      </HelpNote>

      <AdminCard title="Brand & contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name" value={s.brandName} onChange={(e) => setS({ ...s, brandName: e.target.value })} />
          <Field label="WhatsApp number" hint="Digits only, e.g. 254700000000" value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} />
          <Field label="Hero tagline" className="sm:col-span-2" value={s.heroTagline} onChange={(e) => setS({ ...s, heroTagline: e.target.value })} />
        </div>
      </AdminCard>

      <AdminCard title="Delivery">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Free-shipping threshold (KES)" hint="Orders over this ship free" type="number" value={s.freeShipThreshold} onChange={(e) => setS({ ...s, freeShipThreshold: Number(e.target.value) })} />
          <Field label="Standard shipping fee (KES)" type="number" value={s.shippingFee} onChange={(e) => setS({ ...s, shippingFee: Number(e.target.value) })} />
        </div>
      </AdminCard>

      <AdminCard
        title="Promo codes"
        desc="Codes customers can enter at the cart"
        action={
          <button onClick={() => setPromos([...s.promos, { code: "NEWCODE", kind: "percent", value: 10, label: "10% off" }])} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-brand-500">
            <Plus size={15} /> Add code
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          {s.promos.map((p, i) => (
            <div key={i} className="grid items-end gap-3 rounded-xl border border-border p-3 sm:grid-cols-[8rem_9rem_6rem_1fr_auto]">
              <Field label="Code" value={p.code} onChange={(e) => setPromos(s.promos.map((x, j) => j === i ? { ...x, code: e.target.value.toUpperCase() } : x))} />
              <Select label="Type" value={p.kind} onChange={(e) => setPromos(s.promos.map((x, j) => j === i ? { ...x, kind: e.target.value as PromoCode["kind"] } : x))}>
                <option value="percent">% off</option>
                <option value="ship">Free shipping</option>
              </Select>
              <Field label="Value %" type="number" value={p.value ?? ""} disabled={p.kind === "ship"} onChange={(e) => setPromos(s.promos.map((x, j) => j === i ? { ...x, value: Number(e.target.value) } : x))} />
              <Field label="Label" value={p.label} onChange={(e) => setPromos(s.promos.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <button onClick={() => setPromos(s.promos.filter((_, j) => j !== i))} className="mb-1 grid size-10 place-items-center rounded-lg text-muted hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Btn, Card, Field, PageHeader, TextArea, api } from "@/components/admin/kit";
import { useToast } from "@/context/toast";
import type { Announcement, SiteSettings } from "@/lib/types";

const tabs = ["Store", "Payments", "SEO", "Shipping", "Footer", "Announcements", "Security"] as const;

export default function SettingsAdmin() {
  const toast = useToast();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Store");
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/admin/settings", "GET").then(setS).catch(() => {}); }, []);
  // deep link, e.g. /admin/settings?tab=Security
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && (tabs as readonly string[]).includes(t)) setTab(t as (typeof tabs)[number]);
  }, []);
  if (!s) return <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS({ ...s, [k]: v });
  const setAnns = (announcements: Announcement[]) => setS({ ...s, announcements });
  const save = async () => {
    setSaving(true);
    try {
      setS(await api("/api/admin/settings", "PUT", s));
      toast("Settings saved — live on the store");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save", "info");
    }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store-wide configuration" actions={tab === "Security" ? undefined : <Btn disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</Btn>} />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "text-foreground" : "text-muted hover:text-foreground"}`}>
            {t}{tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-500" />}
          </button>
        ))}
      </div>

      {tab === "Store" && (
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Brand name" value={s.brandName} onChange={(e) => set("brandName", e.target.value)} />
          <Field label="WhatsApp number" hint="Digits only, e.g. 254700000000" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Field label="Support email" value={s.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          <Field label="Address" value={s.address} onChange={(e) => set("address", e.target.value)} />
          <Field label="Hero tagline" className="sm:col-span-2" value={s.heroTagline} onChange={(e) => set("heroTagline", e.target.value)} />
        </Card>
      )}

      {tab === "Store" && <SystemStatus />}

      {tab === "Payments" && (
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="font-display text-lg font-bold">Lipa na M-Pesa</h2>
            <p className="mt-1 text-sm text-muted">Customers pay to this Till (Buy Goods and Services) at checkout. Confirm each payment in Payments → Resolve payment using the M-Pesa code.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Till number" inputMode="numeric" placeholder="e.g. 5123456" value={s.mpesaTill ?? ""} onChange={(e) => set("mpesaTill", e.target.value.replace(/\D/g, "").slice(0, 10))} />
            <Field label="Business name on M-Pesa" placeholder="SIR VERT ENTERPRISE" value={s.mpesaTillName ?? ""} onChange={(e) => set("mpesaTillName", e.target.value)} />
          </div>
          <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">Accepted at checkout: <b className="text-foreground">M-Pesa (Till)</b> and <b className="text-foreground">Cash on delivery</b>.</p>
        </Card>
      )}

      {tab === "SEO" && (
        <Card className="flex flex-col gap-4 p-6">
          <Field label="Meta title" hint="Shown in the browser tab and search results" value={s.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          <TextArea label="Meta description" hint="~155 characters" rows={3} value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </Card>
      )}

      {tab === "Shipping" && (
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Free-shipping threshold (KES)" type="number" value={s.freeShipThreshold} onChange={(e) => set("freeShipThreshold", Number(e.target.value))} />
          <Field label="Standard shipping fee (KES)" type="number" value={s.shippingFee} onChange={(e) => set("shippingFee", Number(e.target.value))} />
        </Card>
      )}

      {tab === "Footer" && (
        <Card className="flex flex-col gap-4 p-6">
          <TextArea label="Footer blurb" rows={3} value={s.footerBlurb} onChange={(e) => set("footerBlurb", e.target.value)} />
          <div>
            <span className="text-sm font-medium">Social links</span>
            <div className="mt-2 flex flex-col gap-2">
              {s.socials.map((soc, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-2">
                  <input value={soc.label} onChange={(e) => set("socials", s.socials.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} className="h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand-500" />
                  <input value={soc.href} onChange={(e) => set("socials", s.socials.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} placeholder="https://…" className="h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand-500" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {tab === "Announcements" && (
        <Card className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">The thin rotating strip above the header.</p>
            <Btn variant="outline" size="sm" onClick={() => setAnns([...s.announcements, { text: "New announcement", href: "/shop", cta: "Shop now" }])}><Plus size={14} /> Add</Btn>
          </div>
          {s.announcements.map((a, i) => (
            <div key={i} className="grid items-end gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_9rem_7rem_auto]">
              <Field label="Message" value={a.text} onChange={(e) => setAnns(s.announcements.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
              <Field label="Link" value={a.href} onChange={(e) => setAnns(s.announcements.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
              <Field label="Button" value={a.cta} onChange={(e) => setAnns(s.announcements.map((x, j) => j === i ? { ...x, cta: e.target.value } : x))} />
              <button onClick={() => setAnns(s.announcements.filter((_, j) => j !== i))} className="mb-1 grid size-10 place-items-center rounded-lg text-muted hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </Card>
      )}

      {tab === "Security" && <SecurityTab />}
    </div>
  );
}

function SecurityTab() {
  const toast = useToast();
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api("/api/admin/security", "GET").then((d) => setSource(d.source)).catch(() => {}); }, []);

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-bold">Admin password</h2>
      <p className="mt-1 text-sm text-muted">
        {source === "default"
          ? "You're using the default password. Choose your own — it's stored encrypted and signs out every other admin session."
          : "Change the password used to sign in to this admin. Other signed-in devices will be signed out."}
      </p>
      <form
        className="mt-5 grid max-w-xl gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          if (f.get("newPassword") !== f.get("confirm")) return setError("The new passwords don't match.");
          setBusy(true);
          setError("");
          try {
            await api("/api/admin/security", "PUT", { currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") });
            form.reset();
            setSource("custom");
            toast("Admin password changed");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not change the password.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Current password" name="currentPassword" type="password" required autoComplete="current-password" className="sm:col-span-2" />
        <Field label="New password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" hint="8+ characters with a letter and a number" />
        <Field label="Confirm new password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2"><Btn type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</Btn></div>
      </form>
      <div className="mt-6 rounded-xl bg-surface-2 p-4 text-sm text-muted">
        <p className="font-semibold text-foreground">Session security</p>
        <p className="mt-1">Admins are signed out automatically after 15 minutes without activity, and after 12 hours at most.</p>
      </div>
    </Card>
  );
}

function SystemStatus() {
  type Sys = { storage: string; ok: boolean; error: string; email: boolean; google: boolean; host: string | null; urlVar: string | null; tokenVar: string | null; deployment: string };
  const [sys, setSys] = useState<Sys | null>(null);
  const [checking, setChecking] = useState(false);
  const load = useCallback(() => api("/api/admin/system", "GET").then(setSys).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  const check = () => {
    setChecking(true);
    load().finally(() => setChecking(false));
  };
  if (!sys) return null;
  const dbGood = sys.storage === "turso" && sys.ok;
  const rows = [
    {
      label: "Database",
      good: dbGood,
      text:
        sys.storage === "turso"
          ? sys.ok ? `Turso connected (${sys.host}) — orders and accounts are saved permanently.` : `Turso not working: ${sys.error}`
          : sys.error
            ? `Not connected: ${sys.error}`
            : sys.storage === "blob"
              ? "Vercel Blob (works — Turso recommended)"
              : `Not connected — this ${sys.deployment} deployment can't see TURSO_DATABASE_URL, so orders & accounts are temporary.`,
    },
    { label: "Continue with Google", good: sys.google, text: sys.google ? "On" : "Off — add NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel" },
    { label: "Password-reset emails", good: sys.email, text: sys.email ? "On" : "Off — reset links can be sent from Customers (optional: RESEND_API_KEY)" },
  ];
  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-bold">Connections</h2>
        <Btn variant="outline" size="sm" onClick={check} disabled={checking}>{checking ? "Checking…" : "Check again"}</Btn>
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-2.5 text-sm">
            <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${r.good ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden />
            <span className="min-w-0"><b>{r.label}:</b> <span className="break-words text-muted">{r.text}</span></span>
          </li>
        ))}
      </ul>
      {!dbGood && (
        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm text-muted">
          <p className="font-semibold text-foreground">How to fix the database</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Vercel → this project → Settings → Environment Variables.</li>
            <li>
              You need exactly two names: <code className="break-all">TURSO_DATABASE_URL</code> (starts with <code>libsql://</code>) and{" "}
              <code className="break-all">TURSO_AUTH_TOKEN</code> (starts with <code>eyJ</code>). Paste values exactly as Turso shows them.
            </li>
            <li>Tick <b>Production</b> (and Preview) for both — this site is running as <b>{sys.deployment}</b>.</li>
            <li>Deployments → ⋮ on the newest one → <b>Redeploy</b>. New variables only reach new deployments.</li>
            <li>Come back here and press <b>Check again</b>.</li>
          </ol>
          <p className="mt-2 text-xs">
            Found by this deployment: database URL {sys.urlVar ? <b>{sys.urlVar} ✓</b> : <b>none</b>} · token {sys.tokenVar ? <b>{sys.tokenVar} ✓</b> : <b>none</b>}
          </p>
        </div>
      )}
    </Card>
  );
}

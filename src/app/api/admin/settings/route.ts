import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store/store";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { isSafeMediaUrl } from "@/lib/media";
import type { HeroSlide, SiteSettings } from "@/lib/types";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json((await readStore()).settings);
}

const str = (v: unknown, max: number, fallback: string) => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const money = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), 10_000_000) : fallback;
};
const safeHref = (v: unknown) => {
  const h = String(v ?? "").trim().slice(0, 300);
  return /^(https?:\/\/|\/|mailto:|tel:)/i.test(h) || h === "" ? h : "";
};

const color = (v: unknown, fallback: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : fallback);
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
const media = (v: unknown) => (isSafeMediaUrl(v) ? v : undefined);

/** Homepage banners — only known fields, trimmed, with safe links/images. */
function cleanSlides(v: unknown[]): HeroSlide[] {
  return v.slice(0, 20).flatMap((raw, i) => {
    if (!raw || typeof raw !== "object") return [];
    const s = raw as Record<string, unknown>;
    const slide: HeroSlide = {
      id: str(s.id, 60, "") .replace(/[^\w-]/g, "") || `slide-${Date.now()}-${i}`,
      slug: str(s.slug, 120, ""),
      eyebrow: str(s.eyebrow, 60, ""),
      title: str(s.title, 80, ""),
      subtitle: str(s.subtitle, 120, "") || undefined,
      headline: str(s.headline, 120, "") || undefined,
      copy: str(s.copy, 300, ""),
      buttonText: str(s.buttonText, 40, "Shop now"),
      buttonLink: safeHref(s.buttonLink),
      from: color(s.from, "#eef4ff"),
      to: color(s.to, "#0b57d0"),
      overlay: Math.max(0, Math.min(1, Number(s.overlay) || 0)),
      active: s.active !== false,
      startDate: day(s.startDate),
      endDate: day(s.endDate),
      image: media(s.image),
      bannerImage: media(s.bannerImage),
    };
    return [slide];
  });
}

/** Save store settings. Every field is validated/trimmed — only known keys are kept. */
export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json().catch(() => null)) as Partial<SiteSettings> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid settings" }, { status: 400 });

  const store = await readStore();
  const cur = store.settings;
  const email = str(body.supportEmail, 160, cur.supportEmail);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Support email doesn't look right." }, { status: 400 });

  const next: SiteSettings = {
    ...cur,
    brandName: str(body.brandName, 80, cur.brandName) || cur.brandName,
    heroTagline: str(body.heroTagline, 200, cur.heroTagline),
    whatsapp: str(body.whatsapp, 20, cur.whatsapp).replace(/\D/g, ""),
    supportEmail: email,
    address: str(body.address, 160, cur.address),
    seoTitle: str(body.seoTitle, 120, cur.seoTitle) || cur.seoTitle,
    seoDescription: str(body.seoDescription, 320, cur.seoDescription),
    footerBlurb: str(body.footerBlurb, 500, cur.footerBlurb),
    freeShipThreshold: money(body.freeShipThreshold, cur.freeShipThreshold),
    shippingFee: money(body.shippingFee, cur.shippingFee),
    socials: Array.isArray(body.socials)
      ? body.socials.slice(0, 8).map((s) => ({ label: str(s?.label, 30, ""), href: safeHref(s?.href) }))
      : cur.socials,
    announcements: Array.isArray(body.announcements)
      ? body.announcements.slice(0, 10).map((a) => ({ text: str(a?.text, 140, ""), href: safeHref(a?.href) || "/", cta: str(a?.cta, 30, "") })).filter((a) => a.text)
      : cur.announcements,
    mpesaTill: str(body.mpesaTill, 12, cur.mpesaTill ?? "").replace(/\D/g, ""),
    mpesaTillName: str(body.mpesaTillName, 60, cur.mpesaTillName ?? ""),
    // hero slides & promo codes have their own admin pages
    heroSlides: Array.isArray(body.heroSlides) ? cleanSlides(body.heroSlides) : cur.heroSlides,
    promos: Array.isArray(body.promos) ? body.promos : cur.promos,
  };
  store.settings = next;
  await writeStore(store);
  return NextResponse.json(next);
}

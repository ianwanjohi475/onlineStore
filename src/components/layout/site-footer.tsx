import { Globe, Mail, MapPin, Phone, Send, ShieldCheck, Truck } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import Link from "next/link";
import type { ComponentType } from "react";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Logo } from "./logo";
import { getCategories, getSettings } from "@/lib/store/store";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Flash sales", href: "/flash-sales" },
      { label: "New arrivals", href: "/categories/new-arrivals" },
      { label: "Best sellers", href: "/shop?sort=popular" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Track order", href: "/track-order" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & warranty", href: "/returns" },
      { label: "FAQ", href: "/contact#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Journal", href: "/blog" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2l7.8-9L1.5 2h7l4.6 6.1L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-8h2.6l.4-3h-3V8.1c0-.9.3-1.5 1.6-1.5H16.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.5v3h2.6v8h3.4Z" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" aria-hidden>
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18.1 5.6 12 5.6 12 5.6s-6.1 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.8.5 7.9.5 7.9.5s6.1 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

const socialIcons: Record<string, ComponentType> = {
  instagram: IgIcon,
  x: XIcon,
  twitter: XIcon,
  facebook: FbIcon,
  youtube: YtIcon,
};

export async function SiteFooter() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  // only real links set in Admin → Settings → Footer
  const socials = (settings.socials ?? []).filter((s) => /^https?:\/\//i.test(s.href));
  return (
    <footer className="mt-20 bg-navy text-white">
      {/* trust strip */}
      <div className="border-b border-white/10">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Fast, tracked delivery", text: "Next-day in Nairobi, 2–4 days countrywide" },
            { icon: ShieldCheck, title: "12-month warranty", text: "Genuine products, authorised channel" },
            { icon: Send, title: "Easy 15-day returns", text: "Changed your mind? Send it back free" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-cta">
                <f.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-white/60">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-white/60">{settings.footerBlurb}</p>
          <ul className="mt-4 flex flex-col gap-1.5 text-sm text-white/70">
            {settings.whatsapp && <li className="flex items-center gap-2"><Phone size={14} /> {formatPhone(settings.whatsapp)}</li>}
            {settings.supportEmail && <li className="flex items-center gap-2"><Mail size={14} /> <a href={`mailto:${settings.supportEmail}`} className="hover:text-white hover:underline">{settings.supportEmail}</a></li>}
            {settings.address && <li className="flex items-center gap-2"><MapPin size={14} /> {settings.address}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((s) => {
                const Icon = socialIcons[s.label.trim().toLowerCase()] ?? Globe;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">{col.title}</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/80 transition-colors hover:text-cta hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* newsletter band */}
      <div className="border-t border-white/10 bg-navy-2">
        <div className="container-x flex flex-col items-center justify-between gap-6 py-10 md:flex-row">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-display text-xl font-bold">Get the flash-sale drops first</h3>
            <p className="mt-1 text-sm text-white/60">Subscribe for early access, restocks and exclusive codes. No spam.</p>
          </div>
          <NewsletterForm className="w-full max-w-md" />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0d1320]">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/55 md:flex-row">
          <p>© {new Date().getFullYear()} {settings.brandName || "SIR VERT ENTERPRISE"}. All rights reserved.</p>
          <nav className="flex flex-wrap justify-center gap-4">
            {categories.slice(0, 5).map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="hover:text-white">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

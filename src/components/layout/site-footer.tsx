import { Send, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Logo } from "./logo";
import { categories } from "@/lib/data/categories";

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
      { label: "Warranty", href: "/about#warranty" },
      { label: "FAQ", href: "/contact#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "My account", href: "/account" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Cart", href: "/cart" },
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

const socials: { icon: ComponentType; label: string }[] = [
  { icon: IgIcon, label: "Instagram" },
  { icon: XIcon, label: "X" },
  { icon: FbIcon, label: "Facebook" },
  { icon: YtIcon, label: "YouTube" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      {/* trust strip */}
      <div className="border-b border-border">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Fast, tracked delivery", text: "Next-day in Nairobi, 2–4 days countrywide" },
            { icon: ShieldCheck, title: "12-month warranty", text: "Genuine products, authorised channel" },
            { icon: Send, title: "Easy 15-day returns", text: "Changed your mind? Send it back free" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-600 dark:text-brand-400">
                <f.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Smart accessories, powered for life. Genuine Oraimo audio, wearables and power —
            delivered fast across Kenya and backed by a real warranty.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-brand-500 hover:text-brand-500"
              >
                <s.icon />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{col.title}</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-foreground/80 transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* newsletter band */}
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-6 py-10 md:flex-row">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-display text-xl font-bold">Get the flash-sale drops first</h3>
            <p className="mt-1 text-sm text-muted">Subscribe for early access, restocks and exclusive codes. No spam.</p>
          </div>
          <NewsletterForm className="w-full max-w-md" />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Oraimo Store demo. A design-system showcase — not affiliated with Oraimo.</p>
          <nav className="flex flex-wrap justify-center gap-4">
            {categories.slice(0, 5).map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="hover:text-foreground">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

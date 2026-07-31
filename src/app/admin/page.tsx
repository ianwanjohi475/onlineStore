"use client";

import { Image as ImageIcon, Package, Percent, ShapesIcon, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, HelpNote, api } from "@/components/admin/kit";
import type { Product, SiteSettings } from "@/lib/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api("/api/admin/products", "GET").then(setProducts).catch(() => {});
    api("/api/admin/settings", "GET").then(setSettings).catch(() => {});
  }, []);

  const stats = [
    { label: "Products", value: products?.length ?? "—", icon: Package, href: "/admin/products" },
    { label: "On sale", value: products?.filter((p) => p.compareAt).length ?? "—", icon: Percent, href: "/admin/products" },
    { label: "Hero slides", value: settings?.heroSlides.length ?? "—", icon: ImageIcon, href: "/admin/banners" },
    { label: "In stock", value: products?.filter((p) => p.inStock).length ?? "—", icon: TrendingUp, href: "/admin/products" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted">Manage everything customers see on your store.</p>
      </div>

      <HelpNote>
        <b>Welcome 👋</b> Everything you change here saves instantly and shows on the live store —
        just refresh the storefront tab. Start with <b>Banners &amp; hero</b> to change the homepage
        carousel, or <b>Products</b> to add and edit items.
      </HelpNote>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-500/50">
            <s.icon size={20} className="text-brand-600 dark:text-brand-400" />
            <p className="mt-3 font-display text-3xl font-bold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard title="Quick actions" desc="Jump straight to what you want to change">
          <div className="flex flex-col gap-2">
            {[
              { href: "/admin/banners", label: "Edit homepage banner & hero slides", icon: ImageIcon },
              { href: "/admin/products", label: "Add or edit a product", icon: Package },
              { href: "/admin/categories", label: "Rename or re-order categories", icon: ShapesIcon },
              { href: "/admin/settings", label: "Change delivery, promos & contact", icon: Percent },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-medium transition-colors hover:border-brand-500/50 hover:bg-surface-2">
                <a.icon size={17} className="text-brand-600 dark:text-brand-400" /> {a.label}
              </Link>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="How this works" desc="Plain-English guide">
          <ul className="flex flex-col gap-3 text-sm text-muted">
            <li><b className="text-foreground">1. Make a change</b> — edit a field and press Save.</li>
            <li><b className="text-foreground">2. It saves to your store</b> — changes are written to a data file on your computer.</li>
            <li><b className="text-foreground">3. See it live</b> — open or refresh the storefront; your change is there.</li>
            <li><b className="text-foreground">Product photos</b> — paste any image URL, or leave blank to use a built-in graphic.</li>
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}

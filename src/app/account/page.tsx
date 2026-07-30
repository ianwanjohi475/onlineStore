"use client";

import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductArt } from "@/components/product/product-art";
import { useWishlist } from "@/context/wishlist";
import { productMap, products } from "@/lib/data/products";
import { cn, formatPrice } from "@/lib/utils";

const orders = [
  { id: "ORA-482910", date: "24 Jul 2026", status: "Delivered", items: ["freepods-4-pro", "ultrabraid-usb-c-100w"], total: 7398 },
  { id: "ORA-479120", date: "11 Jul 2026", status: "In transit", items: ["watch-meta-ultra"], total: 8999 },
  { id: "ORA-471003", date: "2 Jul 2026", status: "Delivered", items: ["powercore-27000", "gan-cube-67w"], total: 9298 },
];

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export default function AccountPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const wishlist = useWishlist();
  const saved = wishlist.slugs.map((s) => productMap[s]).filter(Boolean);

  return (
    <div className="container-x py-12">
      <div className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full bg-brand-500 font-display text-2xl font-bold text-brand-950">JW</span>
        <div>
          <h1 className="font-display text-2xl font-bold">Hello, Jane 👋</h1>
          <p className="text-sm text-muted">jane@email.com · Member since 2025</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors", tab === t.id ? "bg-brand-500/12 text-brand-700 dark:text-brand-300" : "text-muted hover:bg-surface-2")}
              >
                <t.icon size={17} /> {t.label}
              </button>
            ))}
            <button className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2">
              <LogOut size={17} /> Sign out
            </button>
          </nav>
        </aside>

        <div>
          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total orders", value: orders.length },
                { label: "In transit", value: orders.filter((o) => o.status === "In transit").length },
                { label: "Saved items", value: wishlist.hydrated ? saved.length : 0 },
              ].map((s) => (
                <div key={s.label} className="card-surface p-6">
                  <p className="font-display text-4xl font-bold text-brand-600 dark:text-brand-400">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              ))}
              <div className="card-surface p-6 sm:col-span-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-brand-500" /> Default address</div>
                <p className="mt-2 text-sm text-muted">Jane Wanjiru · +254 700 000 000<br />Kimathi Street, Nairobi CBD, 00100</p>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="flex flex-col gap-4">
              {orders.map((o) => (
                <div key={o.id} className="card-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{o.id}</p>
                      <p className="text-xs text-muted">Placed {o.date}</p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", o.status === "Delivered" ? "bg-brand-500/15 text-brand-700 dark:text-brand-300" : "bg-amber-400/15 text-amber-600")}>
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {o.items.map((slug) => {
                      const p = productMap[slug];
                      return p ? <ProductArt key={slug} category={p.category} accent={p.accent} className="size-14 rounded-xl" glow={false} /> : null;
                    })}
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted">Total</p>
                      <p className="font-bold">{formatPrice(o.total)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm"><Link href="/track-order">Track</Link></Button>
                    <Button variant="ghost" size="sm">Buy again</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "wishlist" && (
            wishlist.hydrated && saved.length === 0 ? (
              <div className="card-surface flex flex-col items-center gap-3 p-14 text-center">
                <Heart size={30} className="text-muted" />
                <p className="font-semibold">No saved items yet</p>
                <Button asChild><Link href="/shop">Browse products</Link></Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(wishlist.hydrated ? saved : products.slice(0, 2)).map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} className="card-surface flex items-center gap-3 p-3">
                    <ProductArt category={p.category} accent={p.accent} className="size-16 rounded-xl" glow={false} />
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-sm text-brand-600 dark:text-brand-400">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {tab === "settings" && (
            <div className="card-surface p-6">
              <h2 className="font-display text-lg font-bold">Profile settings</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {["Full name", "Email", "Phone", "City"].map((f) => (
                  <label key={f} className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{f}</span>
                    <input placeholder={f} className="h-11 rounded-xl border border-border bg-surface px-4 outline-none focus:border-brand-500" />
                  </label>
                ))}
              </div>
              <Button className="mt-5">Save changes</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

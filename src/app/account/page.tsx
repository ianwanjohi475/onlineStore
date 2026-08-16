"use client";

import { Heart, LogOut, MapPin, Package, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { useWishlist } from "@/context/wishlist";
import { productMap, products } from "@/lib/data/products";
import { cn, formatPrice } from "@/lib/utils";

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
        <span className="grid size-16 place-items-center rounded-full bg-brand-500 font-display text-2xl font-bold text-brand-950">
          <User size={28} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome 👋</h1>
          <p className="text-sm text-muted">Your SIR VERT ENTERPRISE account</p>
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
                { label: "Total orders", value: 0 },
                { label: "In transit", value: 0 },
                { label: "Saved items", value: wishlist.hydrated ? saved.length : 0 },
              ].map((s) => (
                <div key={s.label} className="card-surface p-6">
                  <p className="font-display text-4xl font-bold text-brand-600 dark:text-brand-400">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              ))}
              <div className="card-surface flex flex-col gap-2 p-6 sm:col-span-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-brand-500" /> Delivery address</div>
                <p className="text-sm text-muted">No address saved yet. Add one at checkout for faster delivery across Kenya.</p>
                <Button asChild size="sm" className="mt-1 self-start"><Link href="/shop">Start shopping</Link></Button>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="card-surface flex flex-col items-center gap-3 p-14 text-center">
              <ShoppingBag size={30} className="text-muted" />
              <p className="font-semibold">No orders yet</p>
              <p className="max-w-sm text-sm text-muted">When you place an order it will appear here so you can track it and reorder in one tap.</p>
              <Button asChild className="mt-1"><Link href="/shop">Browse products</Link></Button>
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
                    <ProductImage product={p} className="size-16 rounded-xl" glow={false} />
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

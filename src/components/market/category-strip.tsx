import {
  BatteryCharging, Cable, Camera, Headphones, Home, Monitor, Rocket, Speaker, Sparkles, Watch, Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/store/store";

const icons: Record<string, LucideIcon> = {
  Headphones, Watch, BatteryCharging, Zap, Cable, Speaker, Home, Monitor, Camera, Sparkles, Rocket,
};

export async function CategoryStrip() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const thumbFor = (slug: string) => products.find((p) => p.category === slug && p.image)?.image ?? null;

  return (
    <section className="container-x py-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3.5" style={{ borderLeft: "4px solid var(--color-brand-500)" }}>
          <h2 className="font-display text-lg font-bold">Shop by category</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => {
            const Icon = icons[c.icon] ?? Sparkles;
            const thumb = thumbFor(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-brand-500/10"
              >
                {thumb ? (
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border bg-white shadow-sm transition-transform group-hover:scale-105">
                    <Image src={thumb} alt={c.name} fill sizes="64px" className="object-cover" />
                  </span>
                ) : (
                  <span
                    className="grid size-16 place-items-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                  >
                    <Icon size={24} />
                  </span>
                )}
                <span className="text-xs font-medium leading-tight">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

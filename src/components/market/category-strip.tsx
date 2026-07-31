import {
  BatteryCharging, Cable, Headphones, Rocket, Speaker, Sparkles, Watch, Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { categories } from "@/lib/data/categories";

const icons: Record<string, LucideIcon> = {
  Headphones, Watch, BatteryCharging, Zap, Cable, Speaker, Sparkles, Rocket,
};

export function CategoryStrip() {
  return (
    <section className="container-x py-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3.5" style={{ borderLeft: "4px solid var(--color-brand-500)" }}>
          <h2 className="font-display text-lg font-bold">Shop by category</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => {
            const Icon = icons[c.icon] ?? Sparkles;
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-brand-500/10"
              >
                <span
                  className="grid size-14 place-items-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                >
                  <Icon size={22} />
                </span>
                <span className="text-xs font-medium leading-tight">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

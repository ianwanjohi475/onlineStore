import {
  BatteryCharging,
  Cable,
  Headphones,
  Rocket,
  Speaker,
  Sparkles,
  Watch,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { categories } from "@/lib/data/categories";

const icons: Record<string, LucideIcon> = {
  Headphones,
  Watch,
  BatteryCharging,
  Zap,
  Cable,
  Speaker,
  Sparkles,
  Rocket,
};

export function CategoryGrid() {
  return (
    <section className="container-x py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Browse" title="Shop by" accent="category" />
        <Reveal>
          <Link href="/categories" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            View all categories →
          </Link>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c, i) => {
          const Icon = icons[c.icon] ?? Sparkles;
          return (
            <Reveal key={c.slug} index={i}>
              <Link
                href={`/categories/${c.slug}`}
                className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border border-border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                style={{ background: `linear-gradient(150deg, ${c.gradient[0]}1a, transparent 70%)` }}
              >
                <div
                  aria-hidden
                  className="absolute -right-6 -top-6 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: c.gradient[0] }}
                />
                <span
                  className="grid size-12 place-items-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                >
                  <Icon size={22} />
                </span>
                <div>
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-xs text-muted">{c.tagline}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

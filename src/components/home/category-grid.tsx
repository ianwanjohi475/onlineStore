import Link from "next/link";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { getCategories } from "@/lib/store/store";

export async function CategoryGrid() {
  const categories = await getCategories();
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
                  className="relative grid size-14 place-items-center rounded-2xl bg-surface shadow-lg transition-transform group-hover:scale-110"
                >
                  <CategoryIcon slug={c.slug} className="size-9" />
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

import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-icon";
import { getCategories } from "@/lib/store/store";

export async function CategoryStrip() {
  const categories = await getCategories();

  return (
    <section className="container-x py-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-bold">Shop by category</h2>
          <Link href="/categories" className="text-sm font-semibold text-brand-600 hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-4 gap-1 p-3 sm:grid-cols-6 lg:grid-cols-11">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <CategoryBadge slug={c.slug} className="size-14 transition-transform duration-200 group-hover:scale-110 sm:size-16" size={26} />
              <span className="text-[11px] font-medium leading-tight sm:text-xs">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

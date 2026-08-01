import { CheckCircle2, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { seededRandom } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";

const names = ["Wanjiku M.", "Otieno K.", "Achieng O.", "Kamau N.", "Njeri W.", "Hassan A.", "Chebet R.", "Mutua S."];
const titles = ["Exactly as described", "Worth every shilling", "My new favourite", "Solid and reliable", "Impressed", "Great value"];
const bodies = [
  "Arrived next day and works flawlessly. The build quality genuinely surprised me for the price.",
  "I was skeptical but this exceeded expectations. Battery life is as advertised and setup took seconds.",
  "Second order from SIR VERT ENTERPRISE and the consistency is why I keep coming back. Highly recommend.",
  "Does everything it promises. The finish feels premium and it pairs instantly with my phone.",
  "Great deal during the flash sale. No complaints at all after a month of daily use.",
];

/** Deterministically generate a plausible review set for the product. */
function generate(product: Product) {
  const n = Math.min(5, Math.max(3, Math.round(product.rating)));
  return Array.from({ length: n }).map((_, i) => {
    const r = seededRandom(product.slug + i);
    const rating = Math.max(4, Math.round(product.rating - (r > 0.7 ? 1 : 0)));
    return {
      id: `${product.slug}-${i}`,
      author: names[Math.floor(r * names.length)],
      title: titles[Math.floor(seededRandom(product.slug + "t" + i) * titles.length)],
      body: bodies[Math.floor(seededRandom(product.slug + "b" + i) * bodies.length)],
      rating,
      date: new Date(2026, 6 - i, 2 + Math.floor(r * 20)).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }),
      verified: r > 0.2,
    };
  });
}

export function Reviews({ product }: { product: Product }) {
  const reviews = generate(product);
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const base = stars === 5 ? 0.72 : stars === 4 ? 0.2 : stars === 3 ? 0.05 : 0.02;
    return { stars, pct: Math.round(base * 100) };
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <div className="card-surface h-fit p-6 text-center">
        <p className="font-display text-5xl font-bold">{product.rating.toFixed(1)}</p>
        <Rating value={product.rating} className="mt-2 justify-center" />
        <p className="mt-1 text-sm text-muted">{product.reviewCount.toLocaleString()} verified ratings</p>
        <div className="mt-5 flex flex-col gap-2">
          {breakdown.map((b) => (
            <div key={b.stars} className="flex items-center gap-2 text-xs">
              <span className="flex w-8 items-center gap-0.5 text-muted">{b.stars}<Star size={11} className="fill-brand-500 text-brand-500" /></span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right text-muted tabular-nums">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <article key={r.id} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand-500/12 font-display font-bold text-brand-700 dark:text-brand-300">
                  {r.author[0]}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {r.author}
                    {r.verified && <CheckCircle2 size={13} className="text-brand-500" />}
                  </p>
                  <p className="text-xs text-muted">{r.date}</p>
                </div>
              </div>
              <Rating value={r.rating} />
            </div>
            <h4 className="mt-3 font-semibold">{r.title}</h4>
            <p className="mt-1 text-sm text-muted">{r.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

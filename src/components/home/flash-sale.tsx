import { Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { ProductGrid } from "@/components/product/product-grid";
import { flashSaleProducts } from "@/lib/data/products";

export function FlashSale() {
  // 8 hours from render — deals reset each session for the demo
  const target = Date.now() + 8 * 3600 * 1000;

  return (
    <section className="relative overflow-hidden py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-brand-500)18,transparent)]" />
      <div className="container-x">
        <div className="card-surface flex flex-col items-center gap-5 overflow-hidden p-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
              <Flame size={28} />
            </span>
            <div>
              <span className="eyebrow text-rose-500">Limited time</span>
              <h2 className="font-display text-3xl font-bold">Flash Sale</h2>
              <p className="text-sm text-muted">Hand-picked deals at their lowest prices — while stocks last.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 md:items-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Ends in</span>
            <Countdown target={target} />
          </div>
        </div>

        <div className="mt-8">
          <ProductGrid products={flashSaleProducts.slice(0, 4)} />
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/flash-sales">View all flash deals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Countdown } from "@/components/ui/countdown";
import { ProductGrid } from "@/components/product/product-grid";
import { getFlashSale } from "@/lib/store/store";

export const metadata: Metadata = {
  title: "Flash Sales",
  description: "Live flash deals at their lowest prices. Limited stock, countdown timers — grab yours before they're gone.",
};

export default async function FlashSalesPage() {
  const target = Date.now() + 8 * 3600 * 1000;
  const flashSaleProducts = await getFlashSale();

  return (
    <>
      <PageHero
        eyebrow="Limited time"
        title="Flash"
        accent="sales"
        description="The best prices of the season. When the timer hits zero, these deals are gone."
        crumbs={[{ label: "Flash Sales" }]}
      />

      <div className="container-x py-12">
        <div className="mb-10 flex flex-col items-center gap-4 rounded-[2rem] border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent p-8 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
            <Flame size={28} />
          </span>
          <h2 className="font-display text-2xl font-bold">Today&apos;s deals end in</h2>
          <Countdown target={target} />
          <p className="text-sm text-muted">New deals drop daily at midnight. Subscribe to never miss one.</p>
        </div>

        <ProductGrid products={flashSaleProducts} className="lg:grid-cols-4" />
      </div>
    </>
  );
}

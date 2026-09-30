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
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-rose-500 text-white"><Flame size={16} /></span>
            Today&apos;s deals end in
          </p>
          <Countdown />
          <p className="w-full text-xs text-muted sm:w-auto">New deals every day at midnight.</p>
        </div>

        <ProductGrid products={flashSaleProducts} className="lg:grid-cols-4" />
      </div>
    </>
  );
}

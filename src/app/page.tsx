import { MarketHero } from "@/components/market/market-hero";
import { ServiceStrip } from "@/components/market/service-strip";
import { FlashRail } from "@/components/market/flash-rail";
import { CategoryStrip } from "@/components/market/category-strip";
import { ProductBlock } from "@/components/market/product-block";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";
import { getBestSellers, getByCategory, getFlashSale, getNewArrivals } from "@/lib/store/store";
import { discountPercent } from "@/lib/utils";

export default function HomePage() {
  const flash = getFlashSale();
  const topDeals = [...flash]
    .sort((a, b) => discountPercent(b.compareAt!, b.price) - discountPercent(a.compareAt!, a.price))
    .slice(0, 10);
  const audio = [...getByCategory("earbuds"), ...getByCategory("speakers")].slice(0, 10);
  const power = [...getByCategory("power-banks"), ...getByCategory("chargers")].slice(0, 10);

  return (
    <>
      <MarketHero />
      <ServiceStrip />
      <FlashRail products={flash.slice(0, 10)} />
      <CategoryStrip />
      <ProductBlock title="Top deals this week" subtitle="Biggest discounts, hand-picked" href="/flash-sales" products={topDeals} accent="#f43f5e" />
      <ProductBlock title="Best sellers" subtitle="What Kenya is buying right now" href="/shop?sort=popular" products={getBestSellers().slice(0, 10)} />
      <ProductBlock title="Sound & audio" subtitle="Earbuds, speakers and more" href="/categories/earbuds" products={audio} accent="#34f5c5" />
      <ProductBlock title="Charge & power" subtitle="Power banks, chargers and cables" href="/categories/power-banks" products={power} accent="#7cff6b" />
      <ProductBlock title="New arrivals" subtitle="Fresh off the line" href="/categories/new-arrivals" products={getNewArrivals().slice(0, 10)} accent="#22e188" />
      <Stats />
      <Testimonials />
      <CtaBanner />
    </>
  );
}

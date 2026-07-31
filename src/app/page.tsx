import { MarketHero } from "@/components/market/market-hero";
import { ServiceStrip } from "@/components/market/service-strip";
import { FlashRail } from "@/components/market/flash-rail";
import { CategoryStrip } from "@/components/market/category-strip";
import { ProductBlock } from "@/components/market/product-block";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";
import { bestSellers, getProducts, newArrivals, products } from "@/lib/data/products";
import { discountPercent } from "@/lib/utils";

export default function HomePage() {
  const topDeals = products
    .filter((p) => p.compareAt)
    .sort((a, b) => discountPercent(b.compareAt!, b.price) - discountPercent(a.compareAt!, a.price))
    .slice(0, 10);

  const flash = products.filter((p) => p.compareAt).slice(0, 10);
  const audio = [...getProducts({ category: "earbuds" }), ...getProducts({ category: "speakers" })].slice(0, 10);
  const power = [...getProducts({ category: "power-banks" }), ...getProducts({ category: "chargers" })].slice(0, 10);

  return (
    <>
      <MarketHero />
      <ServiceStrip />
      <FlashRail products={flash} />
      <CategoryStrip />
      <ProductBlock title="Top deals this week" subtitle="Biggest discounts, hand-picked" href="/flash-sales" products={topDeals} accent="#f43f5e" />
      <ProductBlock title="Best sellers" subtitle="What Kenya is buying right now" href="/shop?sort=popular" products={bestSellers.slice(0, 10)} />
      <ProductBlock title="Sound & audio" subtitle="Earbuds, speakers and more" href="/categories/earbuds" products={audio} accent="#34f5c5" />
      <ProductBlock title="Charge & power" subtitle="Power banks, chargers and cables" href="/categories/power-banks" products={power} accent="#7cff6b" />
      <ProductBlock title="New arrivals" subtitle="Fresh off the line" href="/categories/new-arrivals" products={newArrivals.slice(0, 10)} accent="#22e188" />
      <Stats />
      <Testimonials />
      <CtaBanner />
    </>
  );
}

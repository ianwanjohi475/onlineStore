import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse the full Oraimo range — earbuds, smartwatches, power banks, chargers, cables and speakers. Filter by category, price and rating.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const initialSort = (["popular", "price-asc", "price-desc", "rating", "new"].includes(sort ?? "")
    ? sort
    : "popular") as "popular" | "price-asc" | "price-desc" | "rating" | "new";

  return (
    <>
      <PageHero
        eyebrow="The full range"
        title="Shop"
        accent="everything"
        description="Genuine Oraimo tech, filtered your way. Every product ships fast and carries a 12-month warranty."
        crumbs={[{ label: "Shop" }]}
      />
      <ShopBrowser products={products} initialSort={initialSort} />
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getProducts } from "@/lib/store/store";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse the full range — earbuds, smartwatches, power banks, chargers, home appliances, computer accessories and cameras. Filter by category, price and rating.",
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
        description="Genuine tech, filtered your way. Every product ships fast and carries a warranty."
        crumbs={[{ label: "Shop" }]}
      />
      <ShopBrowser products={getProducts()} initialSort={initialSort} />
    </>
  );
}

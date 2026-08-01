import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { CategoryGrid } from "@/components/home/category-grid";

export const metadata: Metadata = {
  title: "Categories",
  description: "Shop by category — earbuds, smartwatches, power banks, chargers, home appliances, computer accessories, cameras and more.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Find your fit"
        title="All"
        accent="categories"
        description="Every way into our range. Pick a lane and start exploring."
        crumbs={[{ label: "Categories" }]}
      />
      <CategoryGrid />
    </>
  );
}

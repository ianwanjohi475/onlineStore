import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { CategoryGrid } from "@/components/home/category-grid";

export const metadata: Metadata = {
  title: "Categories",
  description: "Shop Oraimo by category — earbuds, smartwatches, power banks, chargers, cables, speakers, accessories and new arrivals.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Find your fit"
        title="All"
        accent="categories"
        description="Eight ways into the Oraimo range. Pick a lane and start exploring."
        crumbs={[{ label: "Categories" }]}
      />
      <CategoryGrid />
    </>
  );
}

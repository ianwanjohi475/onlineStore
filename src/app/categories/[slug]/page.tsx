import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/page-hero";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getByCategory, getCategory, getNewArrivals, getProducts } from "@/lib/store/store";
import type { CategorySlug } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `${category.tagline}. Shop genuine ${category.name.toLowerCase()} with fast delivery and a 12-month warranty.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const isNewArrivals = category.slug === "new-arrivals";
  const [list, all] = await Promise.all([
    isNewArrivals ? getNewArrivals() : getByCategory(category.slug as CategorySlug),
    getProducts(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.tagline}
        crumbs={[{ label: "Categories", href: "/categories" }, { label: category.name }]}
      />
      <ShopBrowser
        products={list.length ? list : all}
        initialCategory={isNewArrivals ? undefined : (category.slug as CategorySlug)}
      />
    </>
  );
}

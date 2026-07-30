import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/page-hero";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { categories, categoryMap } from "@/lib/data/categories";
import { getProducts, products } from "@/lib/data/products";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryMap[slug as keyof typeof categoryMap];
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `${category.tagline}. Shop genuine Oraimo ${category.name.toLowerCase()} with fast delivery and a 12-month warranty.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryMap[slug as keyof typeof categoryMap];
  if (!category) notFound();

  const isNewArrivals = category.slug === "new-arrivals";
  const list = isNewArrivals ? products.filter((p) => p.badges.includes("new")) : getProducts({ category: category.slug });

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.tagline}
        crumbs={[{ label: "Categories", href: "/categories" }, { label: category.name }]}
      />
      <ShopBrowser
        products={list.length ? list : products}
        initialCategory={isNewArrivals ? undefined : category.slug}
      />
    </>
  );
}

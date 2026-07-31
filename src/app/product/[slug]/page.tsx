import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/product/product-detail";
import { RelatedProducts } from "@/components/product/related-products";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { getCategory, getProduct, getRelated } from "@/lib/store/store";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.tagline}. ${product.description.slice(0, 120)}…`,
    openGraph: {
      title: `${product.name} · Oraimo`,
      description: product.tagline,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(product);
  const category = getCategory(product.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "Oraimo" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KES",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b border-border">
        <nav className="container-x flex items-center gap-1.5 py-4 text-xs text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/categories/${category?.slug ?? product.category}`} className="hover:text-foreground">{category?.name ?? product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <ProductDetail product={product} />
      <RelatedProducts products={related} />
      <RecentlyViewed exclude={product.slug} />
    </>
  );
}

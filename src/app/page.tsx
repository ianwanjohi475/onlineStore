import { BestSellers } from "@/components/home/best-sellers";
import { BlogPreviews } from "@/components/home/blog-previews";
import { CategoryGrid } from "@/components/home/category-grid";
import { Collections } from "@/components/home/collections";
import { CtaBanner } from "@/components/home/cta-banner";
import { FlashSale } from "@/components/home/flash-sale";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { LogoMarquee } from "@/components/home/logo-marquee";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <CategoryGrid />
      <FlashSale />
      <BestSellers />
      <Collections />
      <Stats />
      <Testimonials />
      <BlogPreviews />
      <CtaBanner />
    </>
  );
}

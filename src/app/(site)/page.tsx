import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryCards from "@/components/home/CategoryCards";
import ProductShowcase from "@/components/home/ProductShowcase";
import ProductCategorySection from "@/components/products/ProductCategorySection";
import BrandStory from "@/components/home/BrandStory";
import PromoBanners from "@/components/home/PromoBanners";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";
import CtaSection from "@/components/home/CtaSection";
import { getCategory } from "@/data/categories";
import {
  bestSellers,
  getProductsByCategory,
  newArrivals,
  products,
} from "@/data/products";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} | ${site.tagline}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Headline category bands on the home page (real store categories).
  const fanCategory = getCategory("fan") ?? null;
  const lightingCategory = getCategory("lighting-solutions") ?? null;
  const fanProducts = fanCategory
    ? getProductsByCategory("fan").slice(0, 4)
    : [];
  const lightingProducts = lightingCategory
    ? getProductsByCategory("lighting-solutions").slice(0, 4)
    : [];

  const hotPicks =
    bestSellers.length >= 4
      ? bestSellers.slice(0, 8)
      : products.slice(0, 8);
  const fresh = newArrivals.length >= 4 ? newArrivals.slice(0, 8) : hotPicks;

  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <CategoryCards />
      <ProductShowcase
        eyebrow="Customer Favourites"
        title="Best | Sellers"
        description="Our most-loved genuine products — from top fans to everyday electrical essentials."
        products={hotPicks}
        viewAllHref="/products"
        tone="white"
        cols={4}
      />
      {fanCategory && (
        <ProductCategorySection
          category={fanCategory}
          products={fanProducts}
          tone="light"
        />
      )}
      <BrandStory />
      {lightingCategory && (
        <ProductCategorySection
          category={lightingCategory}
          products={lightingProducts}
          tone="light"
        />
      )}
      <ProductShowcase
        eyebrow="Just Arrived"
        title="New | Arrivals"
        description="Fresh stock, straight from our trusted suppliers — new products added regularly."
        products={fresh}
        viewAllHref="/products"
        tone="white"
        cols={4}
      />
      <PromoBanners />
      <TestimonialsSlider />
      <CtaSection />
    </>
  );
}

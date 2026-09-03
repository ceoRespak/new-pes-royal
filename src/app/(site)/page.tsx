import type { Metadata } from "next";
import type { CategoryMeta, Product } from "@/types";
import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryCards from "@/components/home/CategoryCards";
import BestSellersBand from "@/components/home/BestSellersBand";
import ProductShowcase from "@/components/home/ProductShowcase";
import PromoBanners from "@/components/home/PromoBanners";
import SloganBanner from "@/components/home/SloganBanner";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";
import WhyChoose from "@/components/home/WhyChoose";
import ExportCta from "@/components/home/ExportCta";
import { categories as snapshotCategories } from "@/data/categories";
import {
  bestSellers as snapshotBestSellers,
  products as snapshotProducts,
} from "@/data/products";
import { getLiveProducts, getLiveCategories } from "@/lib/store/live";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} | ${site.tagline}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
};

// Royalfans-style home page (data from live pespeshawar.pk so admin edits show):
// Hero → USP strip → Shop by Category → Best Sellers (promo + slider)
// → Featured Products → Promo (collections) → Slogan banner
// → Testimonials → Why Choose → Bulk/Export CTA
export default async function HomePage() {
  let liveProducts: Product[] = snapshotProducts;
  let liveCats: CategoryMeta[] = snapshotCategories;
  try {
    [liveProducts, liveCats] = await Promise.all([
      getLiveProducts(),
      getLiveCategories(),
    ]);
  } catch {
    /* offline → snapshot fallback */
  }

  const liveBest = liveProducts.filter((p) => p.bestSeller).slice(0, 10);
  const best =
    liveBest.length > 0 ? liveBest : snapshotBestSellers.slice(0, 10);
  const bestSlugs = new Set(best.map((p) => p.slug));

  // Curated "Featured Products" (skipping anything already shown as best seller).
  const bySlug = new Map(liveProducts.map((p) => [p.slug, p]));
  const featuredSlugs = [
    "royal-celling-fan-56-regency-off-white",
    "royal-celling-fan-56-desire-black",
    "royal-false-ceilling-fan-18-2x2-white",
    "voldam-poweful-metal-exhaust-fan-12",
    "voldam-plastic-glass-exhaust-8-o-w",
    "blue-dot-8-g-smart-switch-black",
    "smd-coarts-12w-4k-65k-v2",
    "opal-15-amp-power-plug-e-series-clipsal",
  ];
  const curated = featuredSlugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => p !== undefined && !bestSlugs.has(p.slug))
    .slice(0, 8);
  const newLive = liveProducts.filter((p) => p.newArrival).slice(0, 8);
  const featured = curated.length >= 4 ? curated : newLive;

  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <CategoryCards cats={liveCats} />
      <BestSellersBand best={best} />
      <ProductShowcase
        storefront
        eyebrow="Curated for you"
        title="Featured Products"
        products={featured}
        viewAllHref="/products"
        viewAllLabel="View All Products"
      />
      <PromoBanners />
      <SloganBanner />
      <TestimonialsSlider />
      <WhyChoose />
      <ExportCta />
    </>
  );
}

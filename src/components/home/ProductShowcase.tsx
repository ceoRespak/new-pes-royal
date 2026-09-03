import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { Product } from "@/types";
import ProductsGrid from "@/components/products/ProductsGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
interface ProductShowcaseProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tone?: "white" | "light";
  cols?: 3 | 4;
  /** Royalfans storefront look: left black title, red "view all", clean cards. */
  storefront?: boolean;
}

/**
 * Generic "heading + product grid" band used on the home page
 * (featured, best sellers, new arrivals...).
 */
export default function ProductShowcase({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  viewAllLabel = "View All Products",
  tone = "white",
  cols = 4,
  storefront = false,
}: ProductShowcaseProps) {
  // Royalfans-style storefront band (light, red accent, black headings)
  if (storefront) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container-px">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-100 pb-3">
            <div>
              {eyebrow && (
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
                  {eyebrow}
                </p>
              )}
              <h2 className="font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
                {title}
              </h2>
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#E11D2A] transition hover:gap-3"
              >
                {viewAllLabel}
                <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <ProductsGrid products={products} cols={cols} storefront />
        </div>
      </section>
    );
  }

  return (
    <section
      className={`section-pad ${
        tone === "light" ? "bg-light/60" : "bg-white"
      }`}
    >
      <div className="container-px">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            align="left"
            className="mb-0"
            eyebrow={eyebrow}
            title={
              <>
                {title.split("|")[0]}{" "}
                {title.includes("|") && (
                  <span className="text-accent">{title.split("|")[1]}</span>
                )}
              </>
            }
            description={description}
          />
          {viewAllHref && (
            <AnimatedSectionWrapper delay={0.1}>
              <Link href={viewAllHref} className="btn-outline shrink-0">
                {viewAllLabel}
              </Link>
            </AnimatedSectionWrapper>
          )}
        </div>
        <div className="mt-10">
          <ProductsGrid products={products} cols={cols} />
        </div>
      </div>
    </section>
  );
}

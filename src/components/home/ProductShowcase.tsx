import Link from "next/link";
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
}: ProductShowcaseProps) {
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

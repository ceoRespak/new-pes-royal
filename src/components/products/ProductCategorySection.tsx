import Link from "next/link";
import type { CategoryMeta, Product } from "@/types";
import ProductCard from "./ProductCard";
import ProductsGrid from "./ProductsGrid";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import { cn } from "@/lib/utils";

interface ProductCategorySectionProps {
  category: CategoryMeta;
  products: Product[];
  /** alternate background color between sections */
  tone?: "white" | "light";
}

/**
 * A full-width band for one product category: header + product grid.
 */
export default function ProductCategorySection({
  category,
  products,
  tone = "white",
}: ProductCategorySectionProps) {
  return (
    <section
      className={cn(
        "section-pad overflow-hidden",
        tone === "light" ? "bg-light/60" : "bg-white"
      )}
    >
      <div className="container-px">
        <AnimatedSectionWrapper>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="h-px w-6 bg-accent" />
                {category.shortName}
              </span>
              <h2 className="heading heading-underline">{category.tagline}</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 md:text-base">
                {category.description}
              </p>
            </div>
            <Link
              href={`/products?category=${category.id}`}
              className="btn-outline shrink-0"
            >
              View All {category.shortName}
            </Link>
          </div>
        </AnimatedSectionWrapper>

        <div className="hidden lg:block">
          <ProductsGrid products={products} cols={4} />
        </div>

        {/* Horizontal snap scroll on tablet/mobile */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 lg:hidden">
          {products.map((p) => (
            <div
              key={p.id}
              className="w-[75%] shrink-0 snap-center sm:w-[46%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

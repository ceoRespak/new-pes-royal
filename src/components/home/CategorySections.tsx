import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { CategoryMeta, Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import CarouselRow from "@/components/ui/CarouselRow";
import { cn } from "@/lib/utils";

interface Block {
  cat: CategoryMeta;
  products: Product[];
}

interface CategorySectionsProps {
  blocks: Block[];
}

/**
 * Home "Browse by category" — one horizontal row per category that has
 * products. Each row holds the category's first 10 cards and scrolls sideways
 * for more, with a "View All N Products" button for the full listing.
 */
export default function CategorySections({ blocks }: CategorySectionsProps) {
  return (
    <>
      {blocks.map(({ cat, products }, i) => (
        <section
          key={cat.id}
          className={i % 2 === 0 ? "bg-white py-10 md:py-14" : "bg-light/40 py-10 md:py-14"}
        >
          <div className="container-px">
            {/* header */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-[0.7rem] font-extrabold uppercase text-white"
                  style={{ background: cat.accent ?? "#002B6B" }}
                >
                  {cat.shortName.slice(0, 2)}
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900 md:text-2xl">
                    {cat.shortName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    {cat.count} product{cat.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <Link
                href={`/products?category=${cat.id}`}
                className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5A00] transition hover:gap-3"
              >
                View All
                <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* first 10 products — auto + manual carousel */}
            <CarouselRow className="-mx-1">
              {products.map((p, idx) => (
                <div
                  key={p.id}
                  className="w-[200px] flex-none snap-start sm:w-[230px]"
                >
                  <ProductCard product={p} storefront priority={idx < 6} />
                </div>
              ))}
            </CarouselRow>

            {/* all-products button */}
            <div className="mt-6 flex justify-center">
              <Link
                href={`/products?category=${cat.id}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border-2 px-7 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
                  i % 2 === 0
                    ? "border-primary/15 text-primary hover:border-primary hover:bg-primary hover:text-white"
                    : "border-[#FF5A00]/25 text-[#FF5A00] hover:border-[#FF5A00] hover:bg-[#FF5A00] hover:text-white"
                )}
              >
                All {cat.count} {cat.shortName} Products
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

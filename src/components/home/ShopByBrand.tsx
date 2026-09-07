import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { BrandRef } from "@/types";
import CarouselRow from "@/components/ui/CarouselRow";

export interface BrandBlock {
  brand: BrandRef;
  count: number;
  image: string;
}

interface ShopByBrandProps {
  /** Auto-detected brands with at least one product, best-sellers first. */
  brands: BrandBlock[];
}

/**
 * Home "Shop by Brand" band — auto-scrolling tiles of the brands that appear
 * in the catalogue. Each tile deep-links to the brand-filtered listing
 * (/products?brand=<id>). Rendered as a plain server section that reuses the
 * client CarouselRow for arrows + autoplay.
 */
export default function ShopByBrand({ brands }: ShopByBrandProps) {
  if (!brands.length) return null;
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="container-px">
        {/* header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <div>
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-[#FF5A00]">
              Trusted Names
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
              Shop by Brand
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5A00] transition hover:gap-3"
          >
            Browse All Brands
            <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <CarouselRow autoplay={brands.length > 6}>
          {brands.map((b) => (
            <Link
              key={b.brand.id}
              href={`/products?brand=${b.brand.id}`}
              className="group w-[158px] flex-none snap-start sm:w-[188px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#FF5A00]/40 group-hover:shadow-lg">
                {b.image ? (
                  <Image
                    src={b.image}
                    alt={b.brand.name}
                    fill
                    sizes="(max-width: 640px) 158px, 188px"
                    className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 font-display text-2xl font-extrabold text-slate-300">
                    {b.brand.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                {/* count chip */}
                <span className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.6rem] font-bold text-white backdrop-blur">
                  {b.count} item{b.count === 1 ? "" : "s"}
                </span>
                {/* label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-transparent p-3 pt-6">
                  <p className="truncate font-display text-sm font-extrabold text-white">
                    {b.brand.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.62rem] font-bold text-white/80">
                    Shop now <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </CarouselRow>
      </div>
    </section>
  );
}

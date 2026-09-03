import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { Product } from "@/types";
import { bestSellers as snapshotBestSellers } from "@/data/products";
import { getCategory } from "@/data/categories";
import ProductCard from "@/components/products/ProductCard";

const promos = [
  {
    id: "fan",
    kicker: "Top Category",
    title: "Ceiling & Bracket Fans",
    line: "Royal, Pak Fan, Lahore Fan & more — copper-wound, quiet & efficient.",
    cta: "Shop Fans",
    href: "/products?category=fan",
  },
  {
    id: "exhaust-fans",
    kicker: "Ventilation",
    title: "Exhaust Fans",
    line: "Kitchen, bath & industrial — powerful airflow with low energy.",
    cta: "Shop Exhaust Fans",
    href: "/products?category=exhaust-fans",
  },
  {
    id: "lighting-solutions",
    kicker: "Bright Ideas",
    title: "LED Lighting",
    line: "Bulbs, battens, panels & floodlights from Philips, Opal & more.",
    cta: "Shop Lighting",
    href: "/products?category=lighting-solutions",
  },
];

/**
 * Royalfans-style "Best Sellers" band: three big promotional cards followed
 * by a horizontally scrollable row of best-selling products.
 */
export default function BestSellersBand({ best }: { best?: Product[] }) {
  const bestSellers =
    best && best.length ? best : snapshotBestSellers.slice(0, 10);
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-px">
        {/* Heading */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
              Handpicked for you
            </p>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#E11D2A] transition hover:gap-3"
          >
            View All Products
            <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Promo cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {promos.map((promo) => {
            const cat = getCategory(promo.id);
            const img = cat?.image;
            return (
              <Link
                key={promo.id}
                href={promo.href}
                className="group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-2xl bg-slate-900"
              >
                {img && (
                  <Image
                    src={img}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-transparent" />
                <div className="relative p-6">
                  <span className="inline-block rounded-full bg-[#E11D2A] px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-widest text-white">
                    {promo.kicker}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-white">
                    {promo.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">{promo.line}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-slate-900 transition-all duration-300 group-hover:bg-[#E11D2A] group-hover:text-white">
                    {promo.cta} <FaArrowRight />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Horizontal best-seller product strip */}
        {bestSellers.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
              Top-rated by our customers
            </h3>
            <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {bestSellers.slice(0, 10).map((product) => (
                <div
                  key={product.id}
                  className="w-[230px] flex-none snap-start sm:w-[250px]"
                >
                  <ProductCard product={product} storefront />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

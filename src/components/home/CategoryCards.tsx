import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { CategoryMeta } from "@/types";
import { categories as snapshotCategories } from "@/data/categories";

export default function CategoryCards({ cats }: { cats?: CategoryMeta[] }) {
  // Only surface categories that actually contain products.
  const visible = (cats ?? snapshotCategories)
    .filter((c) => c.count > 0)
    .slice(0, 8);

  return (
    <section className="bg-light/40 py-12 md:py-16">
      <div className="container-px">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-100 pb-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
              Shop by Category
            </p>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
              Popular Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#E11D2A] transition hover:gap-3"
          >
            View All Categories
            <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {visible.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100"
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.shortName}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
              {/* red edge on hover */}
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E11D2A] transition-transform duration-500 group-hover:scale-x-100" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/70">
                  {cat.count} Products
                </p>
                <p className="mt-0.5 font-display text-lg font-bold leading-tight text-white">
                  {cat.shortName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

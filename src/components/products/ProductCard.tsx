import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaWhatsapp,
  FaRegHeart,
} from "react-icons/fa";
import type { Product } from "@/types";
import RatingStars from "@/components/ui/RatingStars";
import { categoryLabel } from "@/data/categories";
import { site } from "@/data/site";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

/**
 * ProductCard — premium card with hover zoom, floating badges and quick actions.
 */
export default function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const discount = discountPercent(product.price, product.salePrice);
  const waMessage = encodeURIComponent(
    `Hello PES! I'm interested in the ${product.name} (${formatPrice(
      product.price
    )}). Please share more details.`
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-primary/5">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="absolute inset-0 z-0"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>

        {/* top gradient for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary shadow">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Ask about this product on WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#25D366] shadow transition hover:bg-[#25D366] hover:text-white"
          >
            <FaWhatsapp />
          </a>
          <button
            aria-label="Save to wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow transition hover:bg-primary hover:text-white"
          >
            <FaRegHeart />
          </button>
        </div>

        {/* Hover bottom bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-white/95 p-2 backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-primary-800"
          >
            View Details <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-accent">
          {categoryLabel(product.category)}
        </p>
        <h3 className="mt-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-1 font-display text-[0.95rem] font-semibold text-slate-800 transition hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        {product.tagline && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {product.tagline}
          </p>
        )}

        {product.reviews > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-[0.7rem] text-slate-400">
              ({product.reviews})
            </span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {product.salePrice && (
              <p className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </p>
            )}
            <p className="font-display text-lg font-bold text-primary">
              {formatPrice(product.salePrice ?? product.price)}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-600">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                product.inStock ? "bg-emerald-500" : "bg-slate-300"
              )}
            />
            {product.inStock ? "In Stock" : "Call us"}
          </span>
        </div>
      </div>
    </article>
  );
}

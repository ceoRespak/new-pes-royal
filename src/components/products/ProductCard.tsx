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
  /** Storefront look (royalfans-style: clean white card, plain name/price, red CTA). */
  storefront?: boolean;
}

/**
 * ProductCard — premium card with hover zoom, floating badges and quick actions.
 * Set `storefront` for the clean royalfans-style home-page variant.
 */
export default function ProductCard({
  product,
  className,
  priority = false,
  storefront = false,
}: ProductCardProps) {
  const discount = discountPercent(product.price, product.salePrice);
  const waMessage = encodeURIComponent(
    `Hello PES! I'm interested in the ${product.name} (${formatPrice(
      product.price
    )}). Please share more details.`
  );

  // ---- Royalfans-style storefront card (used on the home page) ----
  if (storefront) {
    return (
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl",
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-white">
          <Link
            href={`/products/${product.slug}`}
            aria-label={product.name}
            className="absolute inset-0"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          {/* Badges */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-[#E11D2A] px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider text-white">
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider text-white">
                -{discount}%
              </span>
            )}
          </div>
          {/* WhatsApp quick action */}
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Ask on WhatsApp"
            className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white text-[#25D366] opacity-0 shadow transition hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <FaWhatsapp />
          </a>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {categoryLabel(product.category)}
          </p>
          <h3 className="mt-1">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-[#E11D2A]"
            >
              {product.name}
            </Link>
          </h3>

          {product.reviews > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <RatingStars rating={product.rating} className="!text-amber-400" />
              <span className="text-[0.68rem] text-slate-400">
                ({product.reviews})
              </span>
            </div>
          )}

          <div className="mt-auto flex items-baseline gap-2 pt-2.5">
            {product.salePrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(product.salePrice ?? product.price)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded-lg bg-[#E11D2A] py-2.5 text-center text-[0.7rem] font-bold uppercase tracking-wider text-white transition hover:bg-[#b8111f]"
            >
              View Details
            </Link>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Order on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // ---- Premium card (default) ----
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

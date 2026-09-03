import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaCheckCircle,
  FaChevronRight,
  FaFilePdf,
  FaHome,
  FaStore,
  FaWhatsapp,
} from "react-icons/fa";
import ProductSpecsTable from "@/components/products/ProductSpecsTable";
import ProductsGrid from "@/components/products/ProductsGrid";
import ProductView from "@/components/products/ProductView";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import { categoryLabel, getCategory } from "@/data/categories";
import {
  getProductBySlug,
  relatedProducts,
} from "@/data/products";
import { variantsForProduct } from "@/lib/admin/variants-store";
import {
  getLiveProductBySlug,
  getLiveRelated,
  getLiveCategories,
} from "@/lib/store/live";
import type { Product } from "@/types";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

// Variants are stored locally on this site (see src/lib/admin/variants-store.ts)
// so product pages render live — don't pre-render/SSG them.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Prefer the live backend so admin edits (name/price/badge) show up.
  let product: Product | undefined;
  try {
    product = (await getLiveProductBySlug(params.slug)) ?? getProductBySlug(params.slug);
  } catch {
    product = getProductBySlug(params.slug);
  }
  if (!product) return { title: "Product Not Found" };
  const category = categoryLabel(product.category);
  return {
    title: product.name,
    description: `${
      product.tagline || `${product.name} — genuine ${category}`
    } · ${formatPrice(product.salePrice ?? product.price)} · ${
      site.deliveryInfo
    }`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | Pearl Electric Solutions`,
      description: product.tagline || product.name,
      images: [{ url: product.images[0] }],
    },
  };
}

const askWhatsapp = (productName: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
    `Hello PES! Please confirm details & price of: ${productName}`
  )}`;

export default async function ProductDetailPage({ params }: PageProps) {
  // Live backend first (admin edits show immediately), snapshot as fallback.
  let liveProduct: Product | undefined;
  try {
    liveProduct = await getLiveProductBySlug(params.slug);
  } catch {
    /* offline → fall back to snapshot below */
  }
  const product = liveProduct ?? getProductBySlug(params.slug);
  if (!product) notFound();

  // attach locally-owned variants so the buy panel can offer options
  const localVariants = variantsForProduct(product.id);
  const productWithVariants = {
    ...product,
    variants: localVariants.length ? localVariants : (product.variants ?? []),
  };

  let category = getCategory(product.category);
  let related: Product[] = [];
  try {
    const liveCats = await getLiveCategories();
    category =
      liveCats.find((c) => c.id === product.category) ?? category;
    related = await getLiveRelated(product, 4);
  } catch {
    related = relatedProducts(product);
  }
  if (related.length === 0) related = relatedProducts(product);
  const specs = Object.entries(product.specs ?? {});
  const hasSpecs = specs.length > 0;
  const hasFeatures = (product.features ?? []).length > 0;
  const longDesc =
    product.description ||
    category?.description ||
    `Genuine ${categoryLabel(
      product.category
    )} product available at Pearl Electric Solutions, Peshawar.`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-light/70 pb-4 pt-28 lg:pt-32">
        <div className="container-px">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link href="/" className="flex items-center gap-1.5 hover:text-primary">
              <FaHome /> Home
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-primary"
            >
              {categoryLabel(product.category)}
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <span className="truncate text-primary">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main product section */}
      <section className="section-pad bg-white">
        <div className="container-px">
          <ProductView product={productWithVariants} category={category} />

          {/* Description + Features / Specs + Details */}
          <div className="mt-16 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {hasFeatures && (
                <AnimatedSectionWrapper>
                  <h2 className="font-display text-2xl font-bold text-primary">
                    Key Features
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {(product.features ?? []).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-light/50 p-4 text-sm text-slate-600 transition hover:border-accent/40"
                      >
                        <FaCheckCircle className="mt-0.5 shrink-0 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </AnimatedSectionWrapper>
              )}

              <AnimatedSectionWrapper delay={hasFeatures ? 0.1 : 0}>
                <h2 className="mt-12 font-display text-2xl font-bold text-primary">
                  About this product
                </h2>
                <div className="mt-4 space-y-4 leading-relaxed text-slate-600">
                  <p>{longDesc}</p>
                  <p>
                    {product.name} is a{" "}
                    {(category?.tagline || categoryLabel(product.category))
                      .toLowerCase()}{" "}
                    — sourced from our trusted suppliers and stocked at{" "}
                    {site.name}, Peshawar. For bulk or project pricing, please{" "}
                    <a
                      href={askWhatsapp(product.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary underline underline-offset-4 hover:text-accent"
                    >
                      confirm on WhatsApp
                    </a>
                    .
                  </p>
                </div>
              </AnimatedSectionWrapper>

              {/* Shopping note */}
              <AnimatedSectionWrapper delay={0.15}>
                <div className="mt-8 grid gap-3 rounded-3xl bg-primary-gradient p-6 text-white sm:grid-cols-2">
                  <div>
                    <h4 className="font-display text-base font-bold">
                      {site.deliveryInfo || "Fast local delivery"}
                    </h4>
                    <p className="mt-1 text-sm text-white/70">
                      {site.returnPolicy || "7-day return policy."}
                    </p>
                  </div>
                  <div className="sm:border-l sm:border-white/15 sm:pl-6">
                    <h4 className="font-display text-base font-bold">
                      Visit our shop
                    </h4>
                    <p className="mt-1 text-sm text-white/70">{site.address}</p>
                    <Link
                      href="/contact"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
                    >
                      <FaStore /> Get Directions
                    </Link>
                  </div>
                </div>
              </AnimatedSectionWrapper>
            </div>

            {/* Right rail: specs + details */}
            <div className="lg:col-span-2">
              <AnimatedSectionWrapper>
                <h2 className="font-display text-2xl font-bold text-primary">
                  Technical Specifications
                </h2>
                <div className="mt-5">
                  {hasSpecs ? (
                    <ProductSpecsTable
                      specs={product.specs}
                      warranty={product.warranty || undefined}
                    />
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-light/50 p-6 text-center">
                      <FaFilePdf className="mx-auto text-3xl text-red-400" />
                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        Full specifications available on request
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ask our team for the datasheet or more details about
                        this item.
                      </p>
                      <a
                        href={askWhatsapp(product.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary mt-4 !px-5 !py-2.5 text-xs"
                      >
                        <FaWhatsapp className="text-[#25D366]" /> Ask on
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </AnimatedSectionWrapper>

              <AnimatedSectionWrapper delay={0.1}>
                <h2 className="mt-12 font-display text-2xl font-bold text-primary">
                  Details &amp; Support
                </h2>
                <div className="mt-5 space-y-3">
                  {(product.downloads ?? []).length > 0 ? (
                    (product.downloads ?? []).map((d) => (
                      <a
                        key={d.url + d.label}
                        href={d.url}
                        download
                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-light/50 p-4 transition hover:border-accent/50 hover:bg-accent/5"
                      >
                        <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg text-red-500">
                            <FaFilePdf />
                          </span>
                          {d.label}
                        </span>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-accent">
                          {d.size} ↓
                        </span>
                      </a>
                    ))
                  ) : (
                    <>
                      <a
                        href={askWhatsapp(product.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-light/50 p-4 transition hover:border-[#25D366]/50 hover:bg-[#25D366]/5"
                      >
                        <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-[#25D366]">
                            <FaWhatsapp />
                          </span>
                          Ask about this item on WhatsApp
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Live chat →
                        </span>
                      </a>
                      <p className="rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-slate-500">
                        Need bulk / project pricing, exact stock or a datasheet?
                        Message us and a member of our Peshawar team will reply
                        promptly.
                      </p>
                    </>
                  )}
                </div>
              </AnimatedSectionWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-pad bg-light/60">
          <div className="container-px">
            <SectionHeading
              eyebrow="You May Also Like"
              title={
                <>
                  More in{" "}
                  <span className="text-accent">
                    {categoryLabel(product.category)}
                  </span>
                </>
              }
            />
            <ProductsGrid products={related} cols={4} />
          </div>
        </section>
      )}
    </>
  );
}

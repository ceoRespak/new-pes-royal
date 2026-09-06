import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import ProductCatalog from "@/components/products/ProductCatalog";
import { products as snapshotProducts } from "@/data/products";
import { categories as snapshotCategories } from "@/data/categories";
import { getBrand } from "@/data/brands";
import { mergedTypesFor } from "@/lib/catalog/subcats";
import { getLiveProducts, getLiveCategories } from "@/lib/store/live";
import type { Category, CategoryMeta, Product } from "@/types";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the complete Respak Express range — ceiling, pedestal and wall fans, LED lighting, smart sensors and trusted electrical accessories.",
  alternates: { canonical: "/products" },
};

// Read live so admin-panel edits show up (fallback = imported snapshot).
export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: { category?: string; brand?: string };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  let liveProducts: Product[] = snapshotProducts;
  let liveCats: CategoryMeta[] = snapshotCategories;
  try {
    [liveProducts, liveCats] = await Promise.all([
      getLiveProducts(),
      getLiveCategories(),
    ]);
  } catch {
    /* offline → snapshot fallback */
  }

  const raw = searchParams?.category ?? "all";
  const valid =
    raw !== "all" && liveCats.some((c) => c.id === raw)
      ? (raw as Category)
      : "all";

  const activeCategory = liveCats.find((c) => c.id === valid);

  // Optional brand filter (?brand=<id>) — used by the Shop-by-Brand band and
  // product-page brand tags. Falls back gracefully when the id is unknown.
  const rawBrand = searchParams?.brand ?? null;
  const brandDef = rawBrand ? getBrand(rawBrand) : undefined;
  const validBrand = brandDef ? brandDef.id : null;

  const isBrand = Boolean(brandDef);

  // Admin-set Shop-by-Type card images, keyed `<categoryId>::<typeId>`.
  const subTypeImages: Record<string, string> = {};
  liveCats.forEach((c) => {
    mergedTypesFor(c.name).forEach((t) => {
      if (t.image) subTypeImages[`${c.id}::${t.id}`] = t.image;
    });
  });
  const crumbLabel = isBrand
    ? brandDef?.name
    : valid !== "all" && activeCategory
      ? activeCategory.shortName
      : undefined;

  const title = isBrand
    ? `${brandDef?.name} `
    : valid !== "all" && activeCategory
      ? activeCategory.shortName
      : "Our Complete";
  const highlight = isBrand
    ? "Products"
    : valid !== "all"
      ? "Collection"
      : "Product Range";
  const description = brandDef
    ? brandDef.tagline
      ? `${brandDef.name} — ${brandDef.tagline}. Browse the full ${brandDef.name} range at Respak Express, Peshawar.`
      : `Browse the full ${brandDef.name} range at Respak Express, Peshawar.`
    : valid !== "all" && activeCategory
      ? activeCategory.description
      : "From energy-saving fans and brilliant LED lighting to smart sensors and safety-first electricals — discover the full Respak Express catalogue.";

  return (
    <>
      {/* Slim, compact page header — top padding clears the fixed navbar so
          the title is never hidden behind it. */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-px pb-5 pt-24 lg:pt-32">
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold text-slate-400"
          >
            <Link href="/" className="transition hover:text-primary">
              Home
            </Link>
            <FaChevronRight className="text-[0.5rem]" />
            <Link href="/products" className="transition hover:text-primary">
              Products
            </Link>
            {crumbLabel && (
              <>
                <FaChevronRight className="text-[0.5rem]" />
                <span className="text-primary">{crumbLabel}</span>
              </>
            )}
          </nav>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}{" "}
            {highlight && <span className="text-accent">{highlight}</span>}
          </h1>
          {description && (
            <p className="mt-1.5 line-clamp-1 max-w-3xl text-[0.82rem] text-slate-500">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* Content — minimal top padding (the header already clears the navbar)
          so the collection banner sits right below the title. */}
      <section className="bg-light/60 pb-16 pt-1 md:pb-24 md:pt-2">
        <div className="container-px">
          <ProductCatalog
            products={liveProducts}
            initialCategory={valid}
            initialBrand={validBrand}
            cats={liveCats}
            bannerImage={
              !isBrand && activeCategory?.image
                ? activeCategory.image
                : undefined
            }
            bannerAlt={
              !isBrand && activeCategory
                ? `${activeCategory.shortName} range`
                : undefined
            }
            bannerLabel={
              !isBrand && activeCategory ? activeCategory.shortName : undefined
            }
            subTypeImages={subTypeImages}
          />
        </div>
      </section>
    </>
  );
}

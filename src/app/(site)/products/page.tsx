import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductCatalog from "@/components/products/ProductCatalog";
import { products as snapshotProducts } from "@/data/products";
import { categories as snapshotCategories } from "@/data/categories";
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
  searchParams: { category?: string };
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

  return (
    <>
      <PageHero
        crumb="Products"
        title={
          valid !== "all" && activeCategory
            ? `${activeCategory.shortName}`
            : "Our Complete "
        }
        highlight={valid !== "all" ? "Collection" : "Product Range"}
        description={
          valid !== "all" && activeCategory
            ? activeCategory.description
            : "From energy-saving fans and brilliant LED lighting to smart sensors and safety-first electricals — discover the full Respak Express catalogue."
        }
      />

      <section className="section-pad bg-light/60">
        <div className="container-px">
          <ProductCatalog products={liveProducts} initialCategory={valid} />
        </div>
      </section>
    </>
  );
}

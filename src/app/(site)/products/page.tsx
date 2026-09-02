import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductCatalog from "@/components/products/ProductCatalog";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the complete PES range — ceiling, pedestal and wall fans, LED lighting, smart sensors and trusted electrical accessories.",
  alternates: { canonical: "/products" },
};

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const raw = searchParams?.category ?? "all";
  const valid =
    raw !== "all" && categories.some((c) => c.id === raw)
      ? (raw as Category)
      : "all";

  const activeCategory = categories.find((c) => c.id === valid);

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
            : "From energy-saving fans and brilliant LED lighting to smart sensors and safety-first electricals — discover the full Pearl Electric Solutions catalogue."
        }
      />

      <section className="section-pad bg-light/60">
        <div className="container-px">
          <ProductCatalog products={products} initialCategory={valid} />
        </div>
      </section>
    </>
  );
}

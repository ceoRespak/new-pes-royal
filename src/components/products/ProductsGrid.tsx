import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import { StaggerGroup, StaggerItem } from "@/components/ui/AnimatedSectionWrapper";

interface ProductsGridProps {
  products: Product[];
  cols?: 3 | 4;
  storefront?: boolean;
}

export default function ProductsGrid({
  products,
  cols = 4,
  storefront = false,
}: ProductsGridProps) {
  // Dense, responsive grid: 2 (mobile) → 3 → 4 → 5 across on large screens.
  // Keeps product images compact and pages light — essential for big catalogs.
  const colClass =
    cols === 3
      ? "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
      : "grid grid-cols-2 gap-3.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
        <p className="font-display text-lg font-semibold text-primary">
          No products found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different category or clear your search.
        </p>
      </div>
    );
  }

  return (
    <StaggerGroup className={colClass}>
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full">
          <ProductCard
            product={product}
            className="h-full"
            storefront={storefront}
          />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

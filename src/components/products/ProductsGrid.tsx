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
  const colClass =
    cols === 3
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

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

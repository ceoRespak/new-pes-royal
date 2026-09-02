import type { Metadata } from "next";
import { backendGet } from "@/lib/admin/backend";
import { loadVariants } from "@/lib/admin/variants-store";
import ProductsManager from "@/components/admin/ProductsManager";

export const metadata: Metadata = { title: "Products | Admin" };

interface LiveProduct {
  id: string;
  name: string;
  desc?: string;
  price?: string;
  sale_price?: string;
  on_sale?: boolean;
  badge?: string | null;
  image?: string;
  category?: string | null;
  featured?: boolean;
}

export default async function AdminProductsPage() {
  const prodRes = await backendGet<LiveProduct[]>("/api/products");
  const catRes = await backendGet<
    { categories?: { id: string; name: string }[] } | { id: string; name: string }[]
  >("/api/categories");

  const rawCats = Array.isArray(catRes.data)
    ? catRes.data
    : (catRes.data as { categories?: unknown })?.categories ?? [];

  const categories: string[] = (
    rawCats as { id: string; name: string }[]
  )
    .map((c) => c.name)
    .filter(Boolean);

  const store = loadVariants();
  const live = prodRes.ok && Array.isArray(prodRes.data) ? prodRes.data : [];
  // Overlay locally-owned variants so they can be edited & counted.
  const products = live.map((p) => {
    const local = store[p.id] ?? [];
    return local.length
      ? {
          ...p,
          variants: local.map((v) => ({
            title: v.label ?? "",
            price: v.price != null ? String(v.price) : "",
            sale_price: v.salePrice != null ? String(v.salePrice) : "",
            image: v.image ?? "",
          })),
        }
      : p;
  });
  const error = prodRes.ok ? null : prodRes.error;

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
        <p className="mt-1 text-sm text-slate-500">
          {products.length} products live on pespeshawar.pk. Add, edit or hide
          items — changes are saved to the live backend (variants are stored
          locally on this site).
        </p>
      </header>
      {error && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Could not load products: {error}
        </div>
      )}
      <ProductsManager products={products} categories={categories} />
    </div>
  );
}

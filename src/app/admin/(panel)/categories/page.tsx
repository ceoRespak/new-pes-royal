import type { Metadata } from "next";
import { backendGet } from "@/lib/admin/backend";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Categories | Admin" };

interface LiveCat {
  id: string;
  name: string;
  image?: string;
  sort_order?: number;
}

export default async function AdminCategoriesPage() {
  const res = await backendGet<
    { categories?: LiveCat[] } | LiveCat[]
  >("/api/categories");

  const list = Array.isArray(res.data)
    ? res.data
    : (res.data as { categories?: LiveCat[] })?.categories ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Categories
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {list.length} shop categories on pespeshawar.pk.
        </p>
        {!res.ok && (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Could not load categories: {res.error}
          </p>
        )}
      </header>
      <CategoriesManager categories={list} />
    </div>
  );
}

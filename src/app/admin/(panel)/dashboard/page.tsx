import Link from "next/link";
import type { Metadata } from "next";
import {
  FaBoxOpen,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaStore,
  FaTags,
} from "react-icons/fa";
import { backendGet } from "@/lib/admin/backend";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/utils";
import { requireSection, canSection, scopedCategories } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Dashboard | Admin" };

interface LiveProduct {
  id: string;
  name: string;
  category: string;
  price?: string;
  sale_price?: string;
  image?: string;
  on_sale?: boolean;
}

export default async function AdminDashboardPage() {
  const access = requireSection("dashboard");
  const [prodRes, catRes, setRes] = await Promise.all([
    backendGet<LiveProduct[]>("/api/products"),
    backendGet<Record<string, unknown>[]>("/api/categories").catch(() => null),
    backendGet<Record<string, unknown>>("/api/settings").catch(() => null),
  ]);

  let liveProducts = prodRes.ok && Array.isArray(prodRes.data) ? prodRes.data : [];
  const rawCats = catRes?.data as unknown;
  let liveCats = Array.isArray(rawCats)
    ? rawCats
    : ((rawCats as { categories?: unknown[] } | null)?.categories ?? []);
  const settings =
    setRes?.ok && typeof setRes.data === "object" ? setRes.data : null;
  const apiError = prodRes.ok ? null : prodRes.error;

  // Category-scoped managers see only their own products AND categories.
  const scope = scopedCategories(access);
  if (scope) {
    const lower = scope.map((c) => c.toLowerCase());
    liveProducts = liveProducts.filter((p) =>
      lower.includes(String(p.category ?? "").toLowerCase())
    );
    liveCats = (liveCats as { name?: string }[]).filter((c) =>
      lower.includes(String(c?.name ?? "").toLowerCase())
    );
  }

  const recent = [...liveProducts]
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
    .slice(0, 6);

  const hasProducts = canSection(access, "products");
  const hasCats = canSection(access, "categories");
  const hasSettings = canSection(access, "settings");

  const cards: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub: string;
    href: string;
    tone: string;
  }[] = [
    ...(hasProducts
      ? [
          {
            icon: FaBoxOpen,
            label: "Products (local)",
            value: liveProducts.length,
            sub: "Stored on this site",
            href: "/admin/products",
            tone: "from-primary to-primary-600",
          },
        ]
      : []),
    ...(hasCats
      ? [
          {
            icon: FaTags,
            label: "Categories (local)",
            value: liveCats.length,
            sub: "Shop categories in your local store",
            href: "/admin/categories",
            tone: "from-accent to-accent-600",
          },
        ]
      : []),
    ...(hasSettings
      ? [
          {
            icon: FaStore,
            label: "Store",
            value: String(settings?.siteName ?? site.name),
            sub: String(settings?.footerTagline ?? site.tagline),
            href: "/admin/settings",
            tone: "from-primary-600 to-primary",
          },
          {
            icon: FaInfoCircle,
            label: "Where edits go",
            value: "Local",
            sub: "Changes save to your self-hosted store",
            href: "/admin/settings",
            tone: "from-slate-600 to-slate-800",
          },
        ]
      : []),
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back — here’s your store at a glance.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="btn-outline !px-4 !py-2 text-xs"
        >
          <FaExternalLinkAlt /> Preview website
        </Link>
      </header>

      {apiError && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Could not read some live data: {apiError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.tone} text-lg text-white`}
            >
              <c.icon />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              {c.label}
            </p>
            <p className="mt-1 truncate font-display text-2xl font-bold text-primary">
              {typeof c.value === "number" ? c.value : String(c.value)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent products */}
      <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary">
            Recently added products
          </h2>
          {hasProducts && (
            <Link
              href="/admin/products"
              className="text-sm font-bold text-accent hover:underline"
            >
              Manage all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No products found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Product</th>
                  <th className="py-2.5 pr-4 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-700">
                      {p.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{p.category}</td>
                    <td className="py-3 text-slate-500">
                      {p.on_sale && p.sale_price
                        ? formatPrice(Number(p.sale_price.replace(/[^\d]/g, "")) || 0)
                        : formatPrice(
                            Number((p.price || "").replace(/[^\d]/g, "")) || 0
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products by category (scoped to what this account may manage) */}
      {hasProducts && (
        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-primary">
              Products by category
            </h2>
            {hasProducts && (
              <Link
                href="/admin/products"
                className="text-sm font-bold text-accent hover:underline"
              >
                Manage all →
              </Link>
            )}
          </div>
          {liveCats.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No categories found.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {liveCats
                .filter((c) => c && typeof c === "object")
                .map((c) => {
                  const catName = String((c as { name?: string }).name ?? "—");
                  const count = liveProducts.filter(
                    (p) =>
                      String(p.category ?? "").toLowerCase() ===
                      catName.toLowerCase()
                  ).length;
                  const pct =
                    liveProducts.length > 0
                      ? Math.round((count / liveProducts.length) * 100)
                      : 0;
                  return (
                    <div
                      key={String((c as { id?: string }).id ?? catName)}
                      className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {catName}
                        </p>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          {count}
                        </span>
                      </div>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[0.65rem] text-slate-400">
                        {pct}% of your catalog
                      </p>
                    </div>
                  );
                })}
              {liveCats.length === 0 && (
                <p className="text-sm text-slate-400">No categories yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-6 rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-slate-500">
        Editing here saves straight to your <b>self-hosted store</b>{" "}
        (<code className="rounded bg-slate-100 px-1">/.data/store.json</code>).
      </p>
    </div>
  );
}

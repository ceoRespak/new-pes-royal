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
import { products as localProducts } from "@/data/products";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/utils";

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
  const [prodRes, catRes, setRes] = await Promise.all([
    backendGet<LiveProduct[]>("/api/products"),
    backendGet<Record<string, unknown>[]>("/api/categories").catch(() => null),
    backendGet<Record<string, unknown>>("/api/settings").catch(() => null),
  ]);

  const liveProducts = prodRes.ok && Array.isArray(prodRes.data) ? prodRes.data : [];
  const rawCats = catRes?.data as unknown;
  const liveCats = Array.isArray(rawCats)
    ? rawCats
    : ((rawCats as { categories?: unknown[] } | null)?.categories ?? []);
  const settings =
    setRes?.ok && typeof setRes.data === "object" ? setRes.data : null;
  const apiError = prodRes.ok ? null : prodRes.error;

  const recent = [...liveProducts]
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
    .slice(0, 6);

  const cards: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub: string;
    href: string;
    tone: string;
  }[] = [
    {
      icon: FaBoxOpen,
      label: "Products (live)",
      value: liveProducts.length,
      sub: `${localProducts.length} products in this site’s preview`,
      href: "/admin/products",
      tone: "from-primary to-primary-600",
    },
    {
      icon: FaTags,
      label: "Categories (live)",
      value: liveCats.length,
      sub: "Shop categories on pespeshawar.pk",
      href: "/admin/categories",
      tone: "from-accent to-accent-600",
    },
    {
      icon: FaStore,
      label: "Store",
      value: String(settings?.siteName ?? site.name),
      sub: String(settings?.footerTagline ?? site.tagline),
      href: "/admin/settings",
      tone: "from-emerald-500 to-teal-600",
    },
    {
      icon: FaInfoCircle,
      label: "What you edit",
      value: "Goes LIVE",
      sub: "Changes save to the pespeshawar.pk backend",
      href: "/admin/settings",
      tone: "from-slate-600 to-slate-800",
    },
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
          <Link
            href="/admin/products"
            className="text-sm font-bold text-accent hover:underline"
          >
            Manage all →
          </Link>
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

      <p className="mt-6 rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-slate-500">
        Editing here saves straight to the <b>live pespeshawar.pk backend</b>.
        To refresh this premium site’s static preview with the latest data, run{" "}
        <code className="rounded bg-slate-100 px-1">node scripts/import-pes.mjs</code>{" "}
        and restart the dev/build.
      </p>
    </div>
  );
}

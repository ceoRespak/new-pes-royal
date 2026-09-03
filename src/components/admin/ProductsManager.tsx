"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaEdit,
  FaImage,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import UploadButton from "./UploadButton";

export interface AdminVariant {
  title?: string;
  label?: string;
  price?: string | number;
  sale_price?: string | number;
  salePrice?: string | number;
  image?: string;
}

export interface AdminProduct {
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
  /** Multiple options for the same product, e.g. Standard / Premium / Pro. */
  variants?: AdminVariant[];
}

interface Props {
  products: AdminProduct[];
  categories: string[];
}

const BADGES = ["", "Sale", "Top Brand", "New", "Bestseller"];

/** Backend returns relative image paths — resolve for display only. */
const API_ORIGIN = "https://api.pespeshawar.pk";
function toAbs(src?: string): string {
  if (!src) return "";
  return /^https?:\/\//.test(src) ? src : `${API_ORIGIN}${src}`;
}

interface FormState {
  name: string;
  desc: string;
  price: string;
  sale_price: string;
  on_sale: boolean;
  badge: string;
  image: string;
  category: string;
  featured: boolean;
  variants: AdminVariant[];
}

const emptyForm = (categories: string[]): FormState => ({
  name: "",
  desc: "",
  price: "",
  sale_price: "",
  on_sale: true,
  badge: "Sale",
  image: "",
  category: categories[0] ?? "",
  featured: true,
  variants: [],
});

function toForm(p: AdminProduct): FormState {
  return {
    name: p.name ?? "",
    desc: p.desc ?? "",
    price: p.price ?? "",
    sale_price: p.sale_price ?? "",
    on_sale: Boolean(p.on_sale),
    badge: p.badge ?? "",
    image: p.image ?? "",
    category: p.category ?? "",
    featured: Boolean(p.featured),
    // backend/live display uses `label`; our editor uses `title`
    variants: (Array.isArray(p.variants) ? p.variants : []).map((v) => ({
      title: v.title ?? v.label ?? "",
      price: v.price != null ? String(v.price) : "",
      sale_price: v.sale_price != null ? String(v.sale_price) : "",
      image: v.image ?? "",
    })),
  };
}

export default function ProductsManager({ products, categories }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(categories));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        `${p.name} ${p.category ?? ""} ${p.badge ?? ""}`
          .toLowerCase()
          .includes(q);
      const matchesCat = catFilter === "all" || p.category === catFilter;
      return matchesQ && matchesCat;
    });
  }, [products, query, catFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(categories));
    setCreating(true);
  }
  function openEdit(p: AdminProduct) {
    setCreating(false);
    setEditing(p);
    setForm(toForm(p));
  }
  function close() {
    setCreating(false);
    setEditing(null);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setVariant(i: number, patch: Partial<AdminVariant>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    }));
  }
  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { title: "", price: "", sale_price: "" }],
    }));
  }
  function removeVariant(i: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, idx) => idx !== i),
    }));
  }

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 5000);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Save failed");
        setBusy(false);
        return;
      }
      flash("ok", editing ? "Product updated ✓" : "Product created ✓");
      close();
      router.refresh();
    } catch {
      flash("err", "Network error during save.");
    }
    setBusy(false);
  }

  async function remove(p: AdminProduct) {
    if (!window.confirm(`Delete "${p.name}"? This removes it from the live site.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Delete failed");
      } else {
        flash("ok", "Product deleted");
      }
      router.refresh();
    } catch {
      flash("err", "Network error during delete.");
    }
    setBusy(false);
  }

  const priceOf = (p: AdminProduct) => {
    const num = (s?: string) => Number((s || "").replace(/[^\d]/g, "")) || 0;
    const reg = num(p.price);
    const sale = num(p.sale_price);
    if (p.on_sale && sale) return `Rs ${sale.toLocaleString()}`;
    return reg ? `Rs ${reg.toLocaleString()}` : "—";
  };

  return (
    <div>
      {/* toolbar */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-slate-200 bg-light/50 py-2.5 pl-11 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none"
            />
          </label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-light/50 px-4 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={openCreate} className="btn-primary !py-2.5 text-sm">
            <FaPlus /> Add product
          </button>
        </div>
        {notice && (
          <p
            className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${
              notice.kind === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {/* table */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Flags</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.image ? (
                          <Image
                            src={toAbs(p.image)}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-slate-300">
                            <FaImage />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-700">
                          {p.name}
                        </p>
                        {p.badge && (
                          <span className="mt-0.5 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-accent">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.category || "—"}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-primary">{priceOf(p)}</p>
                    {p.on_sale && p.sale_price && (
                      <p className="text-xs text-slate-400 line-through">
                        {p.price}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.on_sale && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-600">
                          On sale
                        </span>
                      )}
                      {p.featured && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.62rem] font-bold text-primary">
                          Featured
                        </span>
                      )}
                      {Array.isArray(p.variants) && p.variants.length > 0 && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.62rem] font-bold text-accent">
                          {p.variants.length} variants
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary transition hover:bg-primary hover:text-white"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(creating || editing) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="my-6 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* gradient header */}
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#E11D2A] via-[#b8111f] to-[#7a0f16] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg backdrop-blur">
                  {editing ? <FaEdit /> : <FaPlus />}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    {editing ? "Edit product" : "Add new product"}
                  </h2>
                  <p className="text-[0.7rem] text-white/80">
                    {editing
                      ? "Update the product — changes save to the live store."
                      : "Create a product — it will appear on the live store."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid gap-x-5 gap-y-5 bg-slate-50/60 p-5 sm:grid-cols-2 sm:p-7">
            {/* 1 · Basic details */}
            <div className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-indigo-700 sm:col-span-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[0.6rem] text-white">
                1
              </span>
              Basic details &amp; pricing
              <span className="h-px flex-1 bg-indigo-200" />
            </div>
            <label className="sm:col-span-2">
              <span className="field">Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="inp"
                  placeholder="e.g. Pak Fan 56 Delux Model Copper"
                />
              </label>

              <label className="block">
                <span className="field">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="inp"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field">Badge</span>
                <select
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                  className="inp"
                >
                  {BADGES.map((b) => (
                    <option key={b || "none"} value={b}>
                      {b || "— no badge —"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field">Price (Rs)</span>
                <input
                  required
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="inp"
                  placeholder="9800"
                />
              </label>
              <label className="block">
                <span className="field">Sale price (Rs)</span>
                <input
                  value={form.sale_price}
                  onChange={(e) => set("sale_price", e.target.value)}
                  className="inp"
                  placeholder="9500"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="field">Image URL</span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={form.image}
                    onChange={(e) => set("image", e.target.value)}
                    className="inp"
                    placeholder="/storage/images/… or https://…"
                  />
                  <UploadButton
                    value={form.image}
                    onChange={(url) => set("image", url)}
                  />
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="field">Description</span>
                <textarea
                  rows={3}
                  value={form.desc}
                  onChange={(e) => set("desc", e.target.value)}
                  className="inp resize-none"
                  placeholder="Short product description…"
                />
              </label>

              {/* Multiple variants */}
              <div className="mt-2 rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm sm:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-violet-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[0.6rem] text-white">
                    2
                  </span>
                  Options &amp; variants (optional)
                  <span className="h-px flex-1 bg-violet-200" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="field !mb-0">Multiple variants</span>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
                  >
                    <FaPlus /> Add variant
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  e.g. Standard / Premium / Pro, or different sizes — each with
                  its own title &amp; price.
                </p>

                {form.variants.length === 0 && (
                  <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    No variants — this is a single-price product.
                  </p>
                )}

                <div className="mt-3 space-y-3">
                  {form.variants.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <label className="col-span-2 sm:col-span-1">
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Title
                          </span>
                          <input
                            value={v.title ?? ""}
                            onChange={(e) => setVariant(i, { title: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="Standard"
                          />
                        </label>
                        <label>
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Price (Rs)
                          </span>
                          <input
                            value={v.price ?? ""}
                            onChange={(e) => setVariant(i, { price: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="12500"
                          />
                        </label>
                        <label>
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Sale (Rs)
                          </span>
                          <input
                            value={v.sale_price ?? ""}
                            onChange={(e) => setVariant(i, { sale_price: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="11900"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                          title="Remove variant"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          value={v.image ?? ""}
                          onChange={(e) => setVariant(i, { image: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                          placeholder="Variant image URL (optional)"
                        />
                        <UploadButton
                          value={v.image ?? ""}
                          onChange={(url) => setVariant(i, { image: url })}
                          label="Upload variant image"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.on_sale}
                    onChange={(e) => set("on_sale", e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  On sale
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Featured
                </label>
              </div>
            </div>

            {form.image && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
                <Image
                  src={toAbs(form.image)}
                  alt="preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <p className="text-xs text-slate-400">Image preview</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E11D2A] to-[#7a0f16] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .field {
          display: block;
          margin-bottom: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #475569;
        }
        .inp {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.6rem 0.9rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all 0.15s;
        }
        .inp:focus {
          border-color: #003366;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

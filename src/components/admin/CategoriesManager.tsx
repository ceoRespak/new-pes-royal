"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEdit, FaImage, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

export interface AdminCategory {
  id: string;
  name: string;
  image?: string;
  sort_order?: number;
}

interface FormState {
  name: string;
  image: string;
  sort_order: number;
}

const API_ORIGIN = "https://api.pespeshawar.pk";
const toAbs = (src?: string) =>
  !src ? "" : /^https?:\/\//.test(src) ? src : `${API_ORIGIN}${src}`;

const empty: FormState = { name: "", image: "", sort_order: 0 };

export default function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setForm({ ...empty, sort_order: categories.length });
    setOpen(true);
  }
  function startEdit(c: AdminCategory) {
    setEditing(c);
    setForm({ name: c.name, image: c.image ?? "", sort_order: c.sort_order ?? 0 });
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(json.error || "Save failed");
      setBusy(false);
      return;
    }
    setNotice(null);
    setOpen(false);
    router.refresh();
    setBusy(false);
  }

  async function remove(c: AdminCategory) {
    if (!window.confirm(`Delete category "${c.name}"? Products inside it may lose their category.`))
      return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(json.error || "Delete failed");
      return;
    }
    setNotice(null);
    router.refresh();
  }

  const sorted = [...categories].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={startCreate} className="btn-primary !py-2.5 text-sm">
          <FaPlus /> Add category
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {c.image ? (
                  <Image src={toAbs(c.image)} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-slate-300">
                    <FaImage />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-primary">
                  {c.name}
                </p>
                <p className="text-xs text-slate-400">Order: {c.sort_order ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => startEdit(c)}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary/5 px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => remove(c)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-primary">
                {editing ? "Edit category" : "Add category"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Name *
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Image URL
                </span>
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                  placeholder="/storage/images/…"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sort order
                </span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-outline !py-2.5 text-sm"
              >
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn-primary !py-2.5 text-sm">
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

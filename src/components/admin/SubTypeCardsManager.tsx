"use client";

import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaImage,
  FaSave,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import UploadButton from "./UploadButton";
import { resolveImage } from "@/lib/images";

interface RowType {
  id: string;
  name: string;
  image?: string;
}
interface CatGroup {
  name: string;
  types: RowType[];
}

const toAbs = resolveImage;

/**
 * Admin editor for the "Shop by Type" cards. Each category lists its
 * auto-detected types (from the code rules); the admin can set/change an image
 * per type (uploaded to local storage) and optionally rename the card label.
 * Saving persists to /.data/subcategory-meta.json — public category pages pick
 * it up on next load (also refreshed live via the meta file mtime stamp).
 */
export default function SubTypeCardsManager() {
  const [groups, setGroups] = useState<CatGroup[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/admin/subcategory-meta", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!on) return;
        if (d?.ok && Array.isArray(d.categories)) {
          setGroups(d.categories.map((c: { name: string; types: RowType[] }) => ({
            name: c.name,
            types: (c.types ?? []).map((t) => ({
              id: t.id,
              name: t.name,
              image: t.image || undefined,
            })),
          })));
        } else {
          setError(d?.error || "Could not load type cards");
        }
      })
      .catch(() => on && setError("Network error loading type cards"));
    return () => {
      on = false;
    };
  }, []);

  const updateType = (
    cat: string,
    id: string,
    patch: Partial<Pick<RowType, "name" | "image">>
  ) => {
    setSavedMsg(null);
    setGroups((g) =>
      g
        ? g.map((grp) =>
            grp.name === cat
              ? {
                  ...grp,
                  types: grp.types.map((t) =>
                    t.id === id ? { ...t, ...patch } : t
                  ),
                }
              : grp
          )
        : g
    );
  };

  async function save(cat: string) {
    const grp = groups?.find((g) => g.name === cat);
    if (!grp) return;
    setSaving(cat);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/admin/subcategory-meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat,
          items: grp.types.map((t) => ({
            id: t.id,
            name: t.name,
            image: t.image || null,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      setSavedMsg(`${cat} — type cards saved.`);
    } catch (e) {
      setSavedMsg(null);
      setError(String((e as Error)?.message || e));
    } finally {
      setSaving(null);
    }
  }

  if (groups === null) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
        {error ? `⚠ ${error}` : "Loading type cards…"}
      </div>
    );
  }

  const totalTypes = groups.reduce((n, g) => n + g.types.length, 0);

  return (
    <section className="mt-8">
      <header className="mb-4">
        <h2 className="font-display text-2xl font-bold text-primary">
          Shop-by-Type card images
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Set the picture shown on each &quot;Shop by type&quot; card of the
          category landing pages. Cards use a product photo automatically until
          you upload a custom image here. ({groups.length} categories,{" "}
          {totalTypes} cards)
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
      {savedMsg && (
        <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          ✓ {savedMsg}
        </p>
      )}

      <div className="space-y-3">
        {groups.map((g) => {
          const isOpen = open === g.name;
          return (
            <div
              key={g.name}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpen(isOpen ? null : g.name)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="font-display text-base font-bold text-primary">
                  {g.name}
                  <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-bold text-accent">
                    {g.types.length}
                  </span>
                </span>
                <FaChevronDown
                  className={cn(!isOpen ? "" : "rotate-180", "text-slate-400")}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-4">
                  {g.types.length === 0 ? (
                    <p className="py-3 text-center text-sm text-slate-400">
                      No type cards defined for this category yet.
                    </p>
                  ) : (
                    <div className="grid gap-2.5">
                      {g.types.map((t) => (
                        <div
                          key={t.id}
                          className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                            {t.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={toAbs(t.image)}
                                alt={t.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-slate-300">
                                <FaImage />
                              </span>
                            )}
                          </div>
                          <input
                            value={t.name}
                            onChange={(e) =>
                              updateType(g.name, t.id, { name: e.target.value })
                            }
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-primary"
                          />
                          <UploadButton
                            value={t.image ?? ""}
                            onChange={(url) =>
                              updateType(g.name, t.id, { image: url })
                            }
                            label="Upload image"
                          />
                          {t.image && (
                            <button
                              title="Remove custom image (back to auto)"
                              onClick={() =>
                                updateType(g.name, t.id, { image: undefined })
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => save(g.name)}
                      disabled={saving === g.name}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800 disabled:opacity-60"
                    >
                      {saving === g.name ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSave />
                      )}
                      Save {g.name} cards
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

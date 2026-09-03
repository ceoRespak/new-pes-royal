"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { heroSlides as defaultSlides } from "@/data/hero";
import type { HeroSlide } from "@/data/hero";

const FEATURE_ICONS = [
  "bolt",
  "sun",
  "star",
  "shield",
  "truck",
  "wifi",
  "award",
  "headset",
  "check",
  "store",
];

const DEFAULT_BG =
  "radial-gradient(1200px 620px at 85% -10%, rgba(26,92,173,0.5), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 58%,#0a4788 100%)";

function newSlide(): HeroSlide {
  return {
    id: `s-${Date.now()}`,
    badge: "",
    eyebrow: "",
    titleA: "Headline",
    titleHighlight: "highlight",
    description: "",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    image: "/images/hero/fan-ad.jpg",
    imageAlt: "Product",
    features: [
      { icon: "bolt", label: "" },
      { icon: "star", label: "" },
      { icon: "shield", label: "" },
      { icon: "truck", label: "" },
    ],
    bg: DEFAULT_BG,
  };
}

function clone(s: HeroSlide): HeroSlide {
  return {
    ...s,
    titleB: s.titleB ?? "",
    cta2Label: s.cta2Label ?? "",
    cta2Href: s.cta2Href ?? "",
    features: (s.features ?? []).map((f) => ({ icon: f.icon, label: f.label })),
  };
}

export default function HomeContentEditor({
  initial,
}: {
  initial: { heroSlides?: HeroSlide[] };
}) {
  const router = useRouter();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    initial.heroSlides && initial.heroSlides.length
      ? initial.heroSlides.map(clone)
      : defaultSlides.map(clone)
  );
  const [open, setOpen] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const setSlide = (i: number, patch: Partial<HeroSlide>) =>
    setHeroSlides((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const setFeature = (i: number, fi: number, patch: { icon?: string; label?: string }) =>
    setHeroSlides((list) =>
      list.map((s, idx) =>
        idx === i
          ? {
              ...s,
              features: (s.features ?? []).map((f, x) => (x === fi ? { ...f, ...patch } : f)),
            }
          : s
      )
    );

  function move(i: number, dir: -1 | 1) {
    setHeroSlides((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      setOpen(j);
      return copy;
    });
  }

  async function save() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroSlides }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(json.error || "Save failed.");
      } else {
        setNotice("Homepage hero saved ✓ — refresh the site to see it.");
      }
      router.refresh();
    } catch {
      setNotice("Network error.");
    }
    setBusy(false);
  }

  const input =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#E11D2A]";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Edit the homepage <b>hero advertisement</b>. Images go in{" "}
          <code>public/images/hero/</code> — reference like{" "}
          <code>/images/hero/my-ad.jpg</code>. More sections are coming next.
        </p>
        <button onClick={save} disabled={busy} className="btn-primary !py-2.5 text-sm">
          <FaSave /> {busy ? "Saving…" : "Save hero"}
        </button>
      </div>

      {notice && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          {notice}
        </p>
      )}

      {/* list */}
      <div className="space-y-4">
        {heroSlides.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={s.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaPlus className="text-slate-300" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                    Slide {i + 1}
                  </span>
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {s.titleA} {s.titleHighlight}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      move(i, -1);
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </span>
                  <span className={isOpen ? "text-[#E11D2A]" : "text-slate-400"}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
                  <Field label="Badge (e.g. Best Sellers)">
                    <input className={input} value={s.badge ?? ""} onChange={(e) => setSlide(i, { badge: e.target.value })} placeholder="★ Best Sellers" />
                  </Field>
                  <Field label="Eyebrow line">
                    <input className={input} value={s.eyebrow} onChange={(e) => setSlide(i, { eyebrow: e.target.value })} />
                  </Field>
                  <Field label="Headline part 1">
                    <input className={input} value={s.titleA} onChange={(e) => setSlide(i, { titleA: e.target.value })} />
                  </Field>
                  <Field label="Highlighted part">
                    <input className={input} value={s.titleHighlight} onChange={(e) => setSlide(i, { titleHighlight: e.target.value })} />
                  </Field>
                  <Field label="Headline part 2 (optional)">
                    <input className={input} value={s.titleB ?? ""} onChange={(e) => setSlide(i, { titleB: e.target.value })} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <textarea rows={2} className={`${input} resize-none`} value={s.description} onChange={(e) => setSlide(i, { description: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Button 1 text">
                    <input className={input} value={s.ctaLabel} onChange={(e) => setSlide(i, { ctaLabel: e.target.value })} />
                  </Field>
                  <Field label="Button 1 link">
                    <input className={input} value={s.ctaHref} onChange={(e) => setSlide(i, { ctaHref: e.target.value })} placeholder="/products?category=fan" />
                  </Field>
                  <Field label="Button 2 text (optional)">
                    <input className={input} value={s.cta2Label ?? ""} onChange={(e) => setSlide(i, { cta2Label: e.target.value })} />
                  </Field>
                  <Field label="Button 2 link">
                    <input className={input} value={s.cta2Href ?? ""} onChange={(e) => setSlide(i, { cta2Href: e.target.value })} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Image path">
                      <input className={input} value={s.image} onChange={(e) => setSlide(i, { image: e.target.value })} placeholder="/images/hero/fan-ad.jpg" />
                      <p className="mt-1 text-xs text-slate-400">
                        Put your banner in <code>public/images/hero/</code> and enter its path here.
                      </p>
                    </Field>
                  </div>

                  {/* feature chips */}
                  <div className="sm:col-span-2">
                    <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
                      Feature chips (image &amp; price update under button)
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(s.features ?? []).map((f, fi) => (
                        <div key={fi} className="flex gap-2">
                          <select
                            className={`${input} !w-28`}
                            value={f.icon}
                            onChange={(e) => setFeature(i, fi, { icon: e.target.value })}
                          >
                            {FEATURE_ICONS.map((ic) => (
                              <option key={ic} value={ic}>
                                {ic}
                              </option>
                            ))}
                          </select>
                          <input
                            className={input}
                            value={f.label}
                            onChange={(e) => setFeature(i, fi, { label: e.target.value })}
                            placeholder="Short claim"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHeroSlides((list) => list.filter((_, x) => x !== i))
                      }
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <FaTrash /> Remove slide
                    </button>
                    <p className="text-xs text-slate-400">Slide {i + 1} of {heroSlides.length}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          const s = newSlide();
          setHeroSlides((list) => [...list, s]);
          setOpen(heroSlides.length);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-bold text-slate-500 transition hover:border-[#E11D2A] hover:text-[#E11D2A]"
      >
        <FaPlus /> Add hero slide
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

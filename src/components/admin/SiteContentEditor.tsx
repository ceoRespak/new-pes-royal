"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowUp,
  FaBullhorn,
  FaChevronDown,
  FaChevronUp,
  FaCommentDots,
  FaFileAlt,
  FaImages,
  FaPhoneAlt,
  FaPlus,
  FaQuoteRight,
  FaSave,
  FaThumbsUp,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { heroSlides as defaultHero } from "@/data/hero";
import { testimonials as defaultTestimonials } from "@/data/testimonials";
import { site } from "@/data/site";
import UploadButton from "@/components/admin/UploadButton";
import type { HeroSlide } from "@/data/hero";

/* ---------------- types & defaults ---------------- */
export interface TrustItem { icon: string; title: string; text: string }
export interface WhyItem { icon: string; title: string; text: string }
export interface PromoBanner { title: string; subtitle?: string; image?: string; link: string }
export interface Testimonial { id: string; quote: string; rating: number; initials: string; name: string; role: string; city: string }
export interface Slogan {
  eyebrow: string; title: string; highlight: string; description: string;
  ctaLabel: string; ctaHref: string;
}

const DEFAULT_TRUST: TrustItem[] = [
  { icon: "truck", title: "Fast Delivery", text: "Same-day in Peshawar · Nationwide courier" },
  { icon: "shield", title: "Genuine Warranty", text: "Official brand products & warranties" },
  { icon: "money", title: "Cash on Delivery", text: "Pay at your doorstep" },
  { icon: "check", title: "Secure Ordering", text: "Order via WhatsApp or call" },
  { icon: "headset", title: "Expert Support", text: "Mon–Sat · 9am – 8pm" },
];
const DEFAULT_SLOGAN: Slogan = {
  eyebrow: "Fans · Lighting · Wires · Protection · Smart Home",
  title: "Everything Electrical for",
  highlight: "Every Space & Season",
  description:
    "From one ceiling fan to a complete building installation — genuine products, honest prices and trusted advice at Pearl Electric Solutions, Peshawar.",
  ctaLabel: "Explore Products",
  ctaHref: "/products",
};
const DEFAULT_WHY: WhyItem[] = [
  { icon: "store", title: "Trusted Local Store", text: "Serving Peshawar from two shops since 2015." },
  { icon: "shield", title: "100% Genuine Products", text: "Royal, Pak Fan, Philips, Schneider, AGE & more." },
  { icon: "tags", title: "Honest Pricing", text: "Best retail & cash prices, no hidden charges." },
  { icon: "headset", title: "Expert After-Sales Support", text: "Warranty help & honest buying advice." },
];

const ICONS = ["truck","shield","money","check","headset","store","tags","award","bolt","star","sun","wifi","headset"];
const FEATURE_ICONS = ["bolt","sun","star","shield","truck","wifi","award","headset","check","store"];
const DEFAULT_BG =
  "radial-gradient(1200px 620px at 85% -10%, rgba(26,92,173,0.5), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 58%,#0a4788 100%)";

const PAGES: { id: string; label: string }[] = [
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
  { id: "support", label: "Support" },
  { id: "gallery", label: "Gallery" },
  { id: "dealers", label: "Dealers" },
];

const resolveImg = (src?: string) =>
  !src
    ? ""
    : /^https?:\/\//i.test(src)
      ? src
      : src.startsWith("/storage/")
        ? `https://api.pespeshawar.pk${src}`
        : src;

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#E11D2A]";
const lbl = "mb-1 block text-[0.68rem] font-bold uppercase tracking-wider text-slate-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={lbl}>{label}</span>
      {children}
    </label>
  );
}

function IconPick({ value, onChange, icons = ICONS }: { value: string; onChange: (v: string) => void; icons?: string[] }) {
  return (
    <select className={`${input} !w-28`} value={value} onChange={(e) => onChange(e.target.value)}>
      {icons.map((i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  );
}

/* ========================================================= */
export default function SiteContentEditor({ initial }: { initial: Record<string, unknown> }) {
  const router = useRouter();

  const pickHero = (initial.heroSlides as HeroSlide[] | undefined) ?? [];
  const pick = <T,>(key: string, fallback: T): T => {
    const v = (initial as Record<string, unknown>)[key];
    return Array.isArray(v) && (v as unknown[]).length ? (v as T) : fallback;
  };

  const [heroSlides, setHero] = useState<HeroSlide[]>(
    pickHero.length ? pickHero : defaultHero
  );
  const [trust, setTrust] = useState<TrustItem[]>(pick("trustStrip", DEFAULT_TRUST));
  const [slogan, setSlogan] = useState<Slogan>((initial.slogan as Slogan) ?? DEFAULT_SLOGAN);
  const [why, setWhy] = useState<WhyItem[]>(pick("whyChoose", DEFAULT_WHY));
  const [whyHeading, setWhyHeading] = useState<string>(
    ((initial.whyChoose as { heading?: string })?.heading) || "Your Trusted Electrical Partner"
  );
  const [promos, setPromos] = useState<PromoBanner[]>(
    pick<PromoBanner[]>("promoBanners", site.promoBanners as unknown as PromoBanner[])
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    pick("testimonials", defaultTestimonials as Testimonial[])
  );
  const [siteInfo, setSiteInfo] = useState<Record<string, string>>(
    (initial.siteInfo as Record<string, string> | undefined) || {}
  );
  const [imgV, setImgV] = useState(0);
  const setInfo = (k: string, v: string) =>
    setSiteInfo((s) => ({ ...s, [k]: v }));
  const [pages, setPages] = useState<Record<string, Record<string, string>>>(
    (initial.pages as Record<string, Record<string, string>> | undefined) || {}
  );
  const setPg = (id: string, f: string, v: string) =>
    setPages((p) => ({ ...p, [id]: { ...(p[id] ?? {}), [f]: v } }));
  const [open, setOpen] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /* ---- generic list helpers ---- */
  const setList = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (i: number, patch: Partial<T>) =>
      setter((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeAt = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (i: number) => setter((list) => list.filter((_, idx) => idx !== i));
  const pushAt = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) =>
    setter((list) => [...list, item]);

  const setSlide = setList(setHero);
  const setTrustItem = setList(setTrust);
  const setWhyItem = setList(setWhy);
  const setPromo = setList(setPromos);
  const setTestimonial = setList(setTestimonials);

  const upsertFeature = (i: number, fi: number, patch: { icon?: string; label?: string }) =>
    setHero((list) =>
      list.map((s, idx) => {
        if (idx !== i) return s;
        const feats = s.features ?? [];
        const arr = Array.from(
          { length: Math.max(feats.length, 4, fi + 1) },
          (_, x) => feats[x] ?? { icon: "bolt", label: "" }
        );
        arr[fi] = { ...arr[fi], ...patch };
        return { ...s, features: arr };
      })
    );

  function move<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, dir: -1 | 1) {
    setter((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      return copy;
    });
  }

  async function save() {
    setBusy(true);
    setNotice(null);
    const body = {
      heroSlides,
      trustStrip: trust,
      slogan,
      whyChoose: { heading: whyHeading, items: why },
      promoBanners: promos,
      testimonials,
      siteInfo: Object.fromEntries(
        Object.entries(siteInfo).filter(([, v]) => String(v).trim() !== "")
      ),
      pages: Object.fromEntries(
        PAGES.map(({ id }) => [
          id,
          Object.fromEntries(
            Object.entries(pages[id] ?? {}).filter(([, v]) =>
              String(v).trim() !== ""
            )
          ),
        ]).filter(([, o]) => Object.keys(o as object).length > 0)
      ),
    };
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setNotice(json.error || "Save failed.");
      else setNotice("Homepage content saved ✓ — refresh the site to see it.");
      router.refresh();
    } catch {
      setNotice("Network error.");
    }
    setBusy(false);
  }

  function RowBtn({ label, title }: { label: string; title?: string }) {
    return <FaArrowUp className="text-slate-400" aria-hidden title={title} />;
  }

  const AddButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-bold text-slate-500 transition hover:border-[#E11D2A] hover:text-[#E11D2A]"
    >
      <FaPlus /> {label}
    </button>
  );

  /* move/remove inline control row for an item */
  function ItemControls({ i, len, moveFn, onRemove }: { i: number; len: number; moveFn: (d: -1 | 1) => void; onRemove: () => void }) {
    return (
      <div className="flex items-center gap-1">
        <button type="button" disabled={i === 0} onClick={() => moveFn(-1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30" title="Move up">
          <FaArrowUp />
        </button>
        <button type="button" disabled={i === len - 1} onClick={() => moveFn(1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30" title="Move down">
          <FaChevronDown />
        </button>
        <button type="button" onClick={onRemove} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Remove">
          <FaTrash />
        </button>
      </div>
    );
  }

  /* Need item move generic bound below; simpler: separate per array move fns */
  const moveTrust = (i: number, d: -1 | 1) => move(setTrust, i, d);
  const moveWhy = (i: number, d: -1 | 1) => move(setWhy, i, d);
  const movePromo = (i: number, d: -1 | 1) => move(setPromos, i, d);
  const moveTesti = (i: number, d: -1 | 1) => move(setTestimonials, i, d);
  const moveHero = (i: number, d: -1 | 1) => move(setHero, i, d);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Edit your homepage — <b>hero ads</b>, trust strip, promo banners,
          slogan, Why-Choose &amp; testimonials. Images go in{" "}
          <code>public/images/hero/</code>. Inner pages &amp; header/footer
          come next.
        </p>
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E11D2A] to-[#7a0f16] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          <FaSave /> {busy ? "Saving…" : "Save all changes"}
        </button>
      </div>
      {notice && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          {notice}
        </p>
      )}

      {/* ============ HERO SLIDES ============ */}
      <Group title="Hero advertisement slides" hint="The big banners people see first — copy, image & buttons." accent="bg-gradient-to-r from-[#E11D2A] to-[#7a0f16]" icon={FaBullhorn} count={heroSlides.length}>
        <div className="space-y-4">
          {heroSlides.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center gap-3 p-4 text-left">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {s.image ? (
                      <Image
                        src={resolveImg(s.image)}
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
                    <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">Slide {i + 1}</span>
                    <span className="block truncate text-sm font-bold text-slate-800">{s.titleA} {s.titleHighlight}</span>
                  </span>
                  <span className={isOpen ? "text-[#E11D2A]" : "text-slate-400"}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {isOpen && (
                  <div className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
                    <Field label="Badge"><input className={input} value={s.badge ?? ""} onChange={(e) => setSlide(i, { badge: e.target.value })} /></Field>
                    <Field label="Eyebrow"><input className={input} value={s.eyebrow} onChange={(e) => setSlide(i, { eyebrow: e.target.value })} /></Field>
                    <Field label="Headline part 1"><input className={input} value={s.titleA} onChange={(e) => setSlide(i, { titleA: e.target.value })} /></Field>
                    <Field label="Highlighted part"><input className={input} value={s.titleHighlight} onChange={(e) => setSlide(i, { titleHighlight: e.target.value })} /></Field>
                    <Field label="Part 2 (optional)"><input className={input} value={s.titleB ?? ""} onChange={(e) => setSlide(i, { titleB: e.target.value })} /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Description"><textarea rows={2} className={`${input} resize-none`} value={s.description} onChange={(e) => setSlide(i, { description: e.target.value })} /></Field>
                    </div>
                    <Field label="Button 1"><input className={input} value={s.ctaLabel} onChange={(e) => setSlide(i, { ctaLabel: e.target.value })} /></Field>
                    <Field label="Button 1 link"><input className={input} value={s.ctaHref} onChange={(e) => setSlide(i, { ctaHref: e.target.value })} /></Field>
                    <Field label="Button 2"><input className={input} value={s.cta2Label ?? ""} onChange={(e) => setSlide(i, { cta2Label: e.target.value })} /></Field>
                    <Field label="Button 2 link"><input className={input} value={s.cta2Href ?? ""} onChange={(e) => setSlide(i, { cta2Href: e.target.value })} /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Image (banner)">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input
                            className={input}
                            value={s.image}
                            onChange={(e) => setSlide(i, { image: e.target.value })}
                            placeholder="/images/hero/fan-ad.jpg or upload below"
                          />
                          <UploadButton
                            value={s.image}
                            onChange={(url) => {
                              setSlide(i, { image: url });
                              setImgV((v) => v + 1);
                            }}
                            label="Upload image"
                          />
                        </div>
                        {s.image && (
                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              key={`${s.image}-${imgV}`}
                              src={`${resolveImg(s.image)}${
                                resolveImg(s.image).includes("?") ? "&" : "?"
                              }v=${imgV}`}
                              alt="Preview"
                              className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                            />
                            <p className="text-xs text-slate-400">
                              Image preview — updates instantly after upload.
                            </p>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          Upload a banner, or put a file in{" "}
                          <code>public/images/hero/</code> and type its path.
                        </p>
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <p className={lbl}>
                        Feature chips — names shown under your buttons
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[0, 1, 2, 3].map((fi) => {
                          const f = (s.features ?? [])[fi];
                          return (
                            <div key={fi} className="flex gap-2">
                              <IconPick
                                icons={FEATURE_ICONS}
                                value={f?.icon ?? "bolt"}
                                onChange={(v) => upsertFeature(i, fi, { icon: v })}
                              />
                              <input
                                className={input}
                                value={f?.label ?? ""}
                                onChange={(e) => upsertFeature(i, fi, { label: e.target.value })}
                                placeholder={`Feature ${fi + 1} name (e.g. Energy saving)`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:col-span-2">
                      <button type="button" onClick={() => removeAt(setHero)(i)} className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white">
                        <FaTrash /> Remove slide
                      </button>
                      <div className="flex items-center gap-1">
                        <button type="button" disabled={i === 0} onClick={() => moveHero(i, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30" title="Move up"><FaArrowUp /></button>
                        <button type="button" disabled={i === heroSlides.length - 1} onClick={() => moveHero(i, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30" title="Move down"><FaChevronDown /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <AddButton
            label="Add hero slide"
            onClick={() => {
              const idx = heroSlides.length;
              setHero((list) => [
                ...list,
                {
                  id: `s-${Date.now()}`,
                  badge: "",
                  eyebrow: "",
                  titleA: "Headline",
                  titleHighlight: "highlight",
                  titleB: "",
                  description: "",
                  ctaLabel: "Shop Now",
                  ctaHref: "/products",
                  cta2Label: "",
                  cta2Href: "",
                  image: "/images/hero/fan-ad.jpg",
                  imageAlt: "Product",
                  features: [
                    { icon: "bolt", label: "" },
                    { icon: "star", label: "" },
                    { icon: "shield", label: "" },
                    { icon: "truck", label: "" },
                  ],
                  bg: DEFAULT_BG,
                } as HeroSlide,
              ]);
              setOpen(idx);
            }}
          />
        </div>
      </Group>

      {/* ============ TRUST STRIP ============ */}
      <Group title="Trust strip (USPs)" hint="The small benefit cards above the category tiles." accent="bg-gradient-to-r from-emerald-500 to-teal-700" icon={FaCheckCircle} count={trust.length}>
        <div className="space-y-3">
          {trust.map((t, i) => (
            <ItemRow key={i} label={t.title} onRemove={() => removeAt(setTrust)(i)}
              controls={<ItemControls i={i} len={trust.length} onRemove={() => removeAt(setTrust)(i)} moveFn={(d) => moveTrust(i, d)} />}>
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr]">
                <IconPick value={t.icon} onChange={(v) => setTrustItem(i, { icon: v })} />
                <input className={input} value={t.title} onChange={(e) => setTrustItem(i, { title: e.target.value })} placeholder="Title" />
                <input className={input} value={t.text} onChange={(e) => setTrustItem(i, { text: e.target.value })} placeholder="Short text" />
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add trust item" onClick={() => pushAt(setTrust, { icon: "truck", title: "New", text: "" } as TrustItem)} />
        </div>
      </Group>

      {/* ============ SLOGAN ============ */}
      <Group title="Slogan banner (mid-page)" hint="The full-width message between sections." accent="bg-gradient-to-r from-indigo-500 to-blue-700" icon={FaQuoteRight} count={1}>
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <Field label="Eyebrow"><input className={input} value={slogan.eyebrow} onChange={(e) => setSlogan({ ...slogan, eyebrow: e.target.value })} /></Field>
          <Field label="Highlight (gold)"><input className={input} value={slogan.highlight} onChange={(e) => setSlogan({ ...slogan, highlight: e.target.value })} /></Field>
          <Field label="Title"><input className={input} value={slogan.title} onChange={(e) => setSlogan({ ...slogan, title: e.target.value })} /></Field>
          <Field label="CTA label"><input className={input} value={slogan.ctaLabel} onChange={(e) => setSlogan({ ...slogan, ctaLabel: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows={2} className={`${input} resize-none`} value={slogan.description} onChange={(e) => setSlogan({ ...slogan, description: e.target.value })} /></Field>
          </div>
        </div>
      </Group>

      {/* ============ WHY CHOOSE ============ */}
      <Group title="Why Choose tiles" hint="The 4 reasons shown near the bottom of the homepage." accent="bg-gradient-to-r from-violet-500 to-purple-800" icon={FaThumbsUp} count={why.length}>
        <div className="space-y-3">
          <input className={input} value={whyHeading} onChange={(e) => setWhyHeading(e.target.value)} placeholder="Heading (e.g. Your Trusted Electrical Partner)" />
          {why.map((w, i) => (
            <ItemRow key={i} label={w.title} onRemove={() => removeAt(setWhy)(i)}>
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr]">
                <IconPick value={w.icon} onChange={(v) => setWhyItem(i, { icon: v })} />
                <input className={input} value={w.title} onChange={(e) => setWhyItem(i, { title: e.target.value })} />
                <input className={input} value={w.text} onChange={(e) => setWhyItem(i, { text: e.target.value })} />
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" disabled={i === 0} onClick={() => moveWhy(i, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaArrowUp /></button>
                <button type="button" disabled={i === why.length - 1} onClick={() => moveWhy(i, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaChevronDown /></button>
                <button type="button" onClick={() => removeAt(setWhy)(i)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><FaTrash /></button>
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add tile" onClick={() => pushAt(setWhy, { icon: "shield", title: "New reason", text: "" } as WhyItem)} />
        </div>
      </Group>

      {/* ============ PROMO BANNERS ============ */}
      <Group title="Promo / collection banners" hint="Image banners linking to a category or page." accent="bg-gradient-to-r from-sky-500 to-cyan-700" icon={FaImages} count={promos.length}>
        <div className="space-y-3">
          {promos.map((p, i) => (
            <ItemRow key={i} label={p.title} onRemove={() => removeAt(setPromos)(i)}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={input} value={p.title} onChange={(e) => setPromo(i, { title: e.target.value })} placeholder="Title" />
                <input className={input} value={p.link} onChange={(e) => setPromo(i, { link: e.target.value })} placeholder="/products?category=…" />
                <input className={input} value={p.subtitle ?? ""} onChange={(e) => setPromo(i, { subtitle: e.target.value })} placeholder="Subtitle" />
                <input className={input} value={p.image ?? ""} onChange={(e) => setPromo(i, { image: e.target.value })} placeholder="Image path or URL" />
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" disabled={i === 0} onClick={() => movePromo(i, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaArrowUp /></button>
                <button type="button" disabled={i === promos.length - 1} onClick={() => movePromo(i, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaChevronDown /></button>
                <button type="button" onClick={() => removeAt(setPromos)(i)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><FaTrash /></button>
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add banner" onClick={() => pushAt(setPromos, { title: "New banner", subtitle: "", image: "", link: "/products" } as PromoBanner)} />
        </div>
      </Group>

      {/* ============ TESTIMONIALS ============ */}
      <Group title="Testimonials" hint="Customer reviews shown in the blue carousel." accent="bg-gradient-to-r from-amber-500 to-orange-700" icon={FaCommentDots} count={testimonials.length}>
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <ItemRow key={t.id} label={t.name} onRemove={() => removeAt(setTestimonials)(i)}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={`${input} sm:col-span-2`} value={t.quote} onChange={(e) => setTestimonial(i, { quote: e.target.value })} placeholder="Quote…" />
                <input className={input} value={t.name} onChange={(e) => setTestimonial(i, { name: e.target.value })} placeholder="Name" />
                <input className={input} value={t.role} onChange={(e) => setTestimonial(i, { role: e.target.value })} placeholder="Role" />
                <input className={input} value={t.city} onChange={(e) => setTestimonial(i, { city: e.target.value })} placeholder="City" />
                <input className={input} type="number" min={1} max={5} value={t.rating} onChange={(e) => setTestimonial(i, { rating: Number(e.target.value) || 5 })} placeholder="Rating 1-5" />
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" disabled={i === 0} onClick={() => moveTesti(i, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaArrowUp /></button>
                <button type="button" disabled={i === testimonials.length - 1} onClick={() => moveTesti(i, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><FaChevronDown /></button>
                <button type="button" onClick={() => removeAt(setTestimonials)(i)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><FaTrash /></button>
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add testimonial" onClick={() => pushAt(setTestimonials, { id: `t-${Date.now()}`, quote: "", rating: 5, initials: "P", name: "Customer", role: "Customer", city: "Peshawar" } as Testimonial)} />
        </div>
      </Group>

      {/* ============ HEADER / FOOTER CONTACT ============ */}
      <Group
        title="Header &amp; Footer (site-wide)"
        hint="Phone, email, hours, address, WhatsApp & footer blurb shown across the site."
        accent="bg-gradient-to-r from-slate-700 to-slate-900"
        icon={FaPhoneAlt}
        count={7}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs text-slate-400">
            Leave a field blank to keep the current value.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone"><input className={input} value={siteInfo.phone ?? ""} onChange={(e) => setInfo("phone", e.target.value)} placeholder="+92 323 5677090" /></Field>
            <Field label="Email"><input className={input} value={siteInfo.email ?? ""} onChange={(e) => setInfo("email", e.target.value)} placeholder="info@pearlectrics.pk" /></Field>
            <Field label="Hours"><input className={input} value={siteInfo.hours ?? ""} onChange={(e) => setInfo("hours", e.target.value)} placeholder="Mon-Sat: 9:00 AM - 8:00 PM" /></Field>
            <Field label="WhatsApp number"><input className={input} value={siteInfo.whatsapp ?? ""} onChange={(e) => setInfo("whatsapp", e.target.value)} placeholder="923001234567" /></Field>
            <div className="sm:col-span-2">
              <Field label="Shop address"><input className={input} value={siteInfo.address ?? ""} onChange={(e) => setInfo("address", e.target.value)} placeholder="Shop No. 01 Haroon Market…" /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Footer about text"><textarea rows={2} className={`${input} resize-none`} value={siteInfo.footerAbout ?? ""} onChange={(e) => setInfo("footerAbout", e.target.value)} /></Field>
            </div>
          </div>
        </div>
      </Group>

      {/* ============ INNER PAGES ============ */}
      <Group
        title="Inner page headings"
        hint="Main heading + highlighted word for About, Contact, Support, Gallery & Dealers."
        accent="bg-gradient-to-r from-rose-500 to-pink-700"
        icon={FaFileAlt}
        count={5}
      >
        <div className="space-y-3">
          {PAGES.map(({ id, label }) => (
            <div key={id} className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-sm font-bold text-slate-700">{label}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={input}
                  value={pages[id]?.title ?? ""}
                  onChange={(e) => setPg(id, "title", e.target.value)}
                  placeholder="Heading"
                />
                <input
                  className={input}
                  value={pages[id]?.highlight ?? ""}
                  onChange={(e) => setPg(id, "highlight", e.target.value)}
                  placeholder="Highlighted word"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Leave blank to keep the current heading.
              </p>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ title, hint, accent, icon: Icon, count, children }: { title: string; hint?: string; accent: string; icon: React.ComponentType; count: number; children: React.ReactNode }) {
  return (
    <details open className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <summary className={`flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-white ${accent}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur">
          <Icon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-bold leading-tight">{title}</span>
          {hint && <span className="block text-xs text-white/80">{hint}</span>}
        </span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">{count}</span>
        <FaChevronDown className="text-xs" />
      </summary>
      <div className="space-y-3 bg-slate-50/50 p-4 sm:p-5">{children}</div>
    </details>
  );
}

function ItemRow({ label, onRemove, controls, children }: { label: string; onRemove: () => void; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-slate-700">{label || "New item"}</span>
        {controls ?? (
          <button type="button" onClick={onRemove} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Remove">
            <FaTrash />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ItemControls helper that also wires move (defined inline in code above to reuse move fns)

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
  FaInfoCircle,
  FaPhoneAlt,
  FaPlus,
  FaQuestionCircle,
  FaQuoteRight,
  FaSave,
  FaStore,
  FaThumbsUp,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { heroSlides as defaultHero } from "@/data/hero";
import { testimonials as defaultTestimonials } from "@/data/testimonials";
import { galleryItems as defaultGalleryItems } from "@/data/gallery";
import { faqs as defaultFaqs } from "@/data/faqs";
import { dealers as defaultDealers } from "@/data/dealers";
import { site } from "@/data/site";
import { resolveImage } from "@/lib/images";
import UploadButton from "@/components/admin/UploadButton";
import HeroImageAdjustModal, { type HeroAdjust } from "@/components/admin/HeroImageAdjustModal";
import type { Faq, Dealer, GalleryItem } from "@/types";
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

export interface AboutSections {
  // Hero + company profile text (whole About page is editable here).
  title: string;
  highlight: string;
  short: string;
  image: string;
  companyHeading: string;
  sinceYear: string;
  location: string;
  p1: string;
  p2: string;
  mission: { title: string; text: string };
  vision: { title: string; text: string };
  approach: { title: string; text: string };
  introPoints: string[];
  values: { icon: string; title: string; text: string }[];
  stats: { value: number; suffix: string; label: string }[];
  milestones: { year: string; title: string; text: string }[];
}

const DEFAULT_ABOUT: AboutSections = {
  title: "Peshawar's Most",
  highlight: "Trusted Electric Shop",
  short:
    "Respak Express has been serving Peshawar since 2015. We provide high-quality electrical products ranging from wires and cables to smart home solutions.",
  image: "/images/about/company.svg",
  companyHeading: "Respak Express",
  sinceYear: "2015",
  location: "Peshawar, Pakistan",
  p1: "Respak Express has been serving the people of Peshawar for over a decade from our location at Shop No. 1, Haroon Market, Karkhano Bazar. We are approved distributors of Pakistan Cables, AGE Cables, and Fast Cables, and stock premium brands including Philips, Schneider, ABB, Opal, Royal Fans, Voldam Fan, Lahore Fan, Pak Fan, BlueDot Smart Home, and more.",
  p2: "Whether you're an electrician, contractor, or homeowner, we provide expert advice and genuine products at the best prices in town. Now you can also shop online — browse our catalog, place your order, and get same-day delivery across Peshawar.",
  mission: {
    title: "Our Mission",
    text: "To supply genuine, quality electrical products at fair prices — and help every customer choose exactly the right item through honest, expert advice.",
  },
  vision: {
    title: "Our Vision",
    text: "To be Peshawar's most trusted electric shop — the first stop for homeowners, electricians and contractors whenever they need quality electrical products.",
  },
  approach: {
    title: "Our Approach",
    text: "We stock only authentic brands, we advise honestly, and we stand behind every sale with same-day delivery and a simple 7-day return policy.",
  },
  introPoints: [
    "Approved distributor of Pakistan Cables, AGE & Fast Cables",
    "Genuine Philips, Schneider, ABB, Opal, Royal & Pak Fan products",
    "Expert advice for electricians, contractors & homeowners",
    "Free same-day delivery across Peshawar",
  ],
  values: [
    { icon: "shield", title: "Integrity", text: "Only genuine, authentic products — and honest advice, always." },
    { icon: "award", title: "Quality Brands", text: "We stock brands we trust: Pakistan Cables, Schneider, ABB, Royal & more." },
    { icon: "heart", title: "Customer Care", text: "Expert guidance for electricians, contractors and homeowners." },
    { icon: "handshake", title: "Fair Partnership", text: "Fair prices and reliable supply for every customer and project." },
  ],
  stats: [
    { value: 10, suffix: "+", label: "Years in Peshawar" },
    { value: 13, suffix: "", label: "Product Categories" },
    { value: 100, suffix: "+", label: "Products Online" },
    { value: 12, suffix: "+", label: "Top Brands" },
  ],
  milestones: [
    { year: "2015", title: "The shop opens", text: "Respak Express opens its doors at Shop No. 1, Haroon Market, Karkhano Bazar, Peshawar — with one promise: genuine products at fair prices." },
    { year: "Growing", title: "Becoming approved distributors", text: "We become approved distributors of Pakistan Cables, AGE Cables and Fast Cables, and start stocking premium brands like Philips, Schneider, ABB, Royal Fans and Pak Fan." },
    { year: "Expanding", title: "A second branch", text: "To serve more customers we open a second outlet at Khyber Bazaar, Peshawar — bringing the same genuine stock and honest advice closer to you." },
    { year: "Online", title: "Shop online, delivered same-day", text: "Our online store goes live with free same-day delivery across Peshawar, letting electricians, contractors and homeowners order from anywhere." },
    { year: "Today", title: "Peshawar's trusted electric shop", text: "From wires and circuit breakers to fans, lighting, DBs and smart home — customers across the city rely on Respak Express every day." },
  ],
};

const DEFAULT_TRUST: TrustItem[] = [
  { icon: "truck", title: "Nationwide Delivery", text: "Fast courier all over Pakistan" },
  { icon: "shield", title: "100% Genuine", text: "Brand products & official warranties" },
  { icon: "money", title: "Cash on Delivery", text: "Pay when your order arrives" },
  { icon: "check", title: "Secure Ordering", text: "Online cart, bank transfer & more" },
  { icon: "headset", title: "Expert Support", text: "Mon–Sat · 9am – 8pm" },
];
const DEFAULT_SLOGAN: Slogan = {
  eyebrow: "Fans · Lighting · Wires · Protection · Smart Home",
  title: "Everything Electrical for",
  highlight: "Every Space & Season",
  description:
    "From one ceiling fan to a complete building installation — genuine products, honest prices and trusted advice at Respak Express, Peshawar.",
  ctaLabel: "Explore Products",
  ctaHref: "/products",
};
const DEFAULT_WHY: WhyItem[] = [
  { icon: "store", title: "Trusted Local Store", text: "Serving Peshawar from two shops since 2015." },
  { icon: "shield", title: "100% Genuine Products", text: "Royal, Pak Fan, Philips, Schneider, AGE & more." },
  { icon: "tags", title: "Honest Pricing", text: "Best retail & cash prices, no hidden charges." },
  { icon: "headset", title: "Expert After-Sales Support", text: "Warranty help & honest buying advice." },
];

const ICONS = ["truck","shield","money","check","headset","store","tags","award","bolt","star","sun","wifi","headset","heart","handshake","eye","bullseye"];
const DEFAULT_BG =
  "radial-gradient(1200px 620px at 85% -10%, rgba(0,71,179,0.5), transparent 60%), linear-gradient(120deg,#001B45 0%,#002B6B 58%,#0047B3 100%)";

const PAGES: { id: string; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "support", label: "Support" },
  { id: "gallery", label: "Gallery" },
  { id: "dealers", label: "Dealers" },
];

const resolveImg = (src?: string) => resolveImage(src);

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF5A00]";
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

function NumStepper({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  const bump = (dir: number) =>
    onChange(Math.max(min, Math.min(max, (Number.isFinite(value) ? value : min) + dir * step)));
  return (
    <div>
      <span className={lbl}>{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-600 transition hover:border-[#FF5A00] hover:text-[#FF5A00]"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className={`${input} !px-1 text-center`}
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
        />
        <button
          type="button"
          onClick={() => bump(1)}
          className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-600 transition hover:border-[#FF5A00] hover:text-[#FF5A00]"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
        {unit && <span className="ml-0.5 w-6 text-xs font-bold text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

/* Recommended hero banner specs (avoid blurry uploads) */
function LineOpts({
  showDesktop,
  showMobile,
  onDesktop,
  onMobile,
  size,
  onSize,
}: {
  showDesktop: boolean;
  showMobile: boolean;
  onDesktop: (v: boolean) => void;
  onMobile: (v: boolean) => void;
  size: number;
  onSize: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(70, Math.min(150, v));
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5">
      <span className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-400">
        Show
      </span>
      <label className="flex cursor-pointer items-center gap-1 text-[0.68rem] font-semibold text-slate-600">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-[#FF5A00]"
          checked={showDesktop}
          onChange={(e) => onDesktop(e.target.checked)}
        />{" "}
        D
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-[0.68rem] font-semibold text-slate-600">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-[#FF5A00]"
          checked={showMobile}
          onChange={(e) => onMobile(e.target.checked)}
        />{" "}
        M
      </label>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSize(clamp(size - 5))}
          className="h-6 w-6 rounded-md bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          aria-label="Decrease size"
        >
          −
        </button>
        <span className="w-11 text-center text-[0.68rem] font-bold text-slate-600">
          {size}%
        </span>
        <button
          type="button"
          onClick={() => onSize(clamp(size + 5))}
          className="h-6 w-6 rounded-md bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          aria-label="Increase size"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* Recommended hero banner specs (avoid blurry uploads) */
function SmallImageUpload({ value, onChange, recommended, minW }: { value: string; onChange: (url: string) => void; recommended: string; minW: number }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-slate-500">
          Banner image
        </span>
        <span className="rounded bg-[#FF5A00]/10 px-2 py-0.5 text-[0.62rem] font-bold text-[#FF5A00]">
          Recommended {recommended}px
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/promo/… or upload below"
        />
        <UploadButton value={value} onChange={onChange} label="Upload" />
      </div>
      {value && (
        <div className="mt-2 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImg(value)}
            alt="Preview"
            className="h-16 w-28 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
            onLoad={(e) => {
              const n = e.currentTarget;
              if (n.naturalWidth && n.naturalHeight)
                setSize({ w: n.naturalWidth, h: n.naturalHeight });
            }}
          />
          {size && (
            <p
              className={`text-[0.68rem] font-semibold ${
                size.w < minW ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {size.w} × {size.h} px —
              {size.w < minW
                ? " smaller than recommended; will look soft/blurry. Upload a bigger, sharper image."
                : " sharp for this banner ✓"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const HERO_SPEC = {
  desktop: {
    label: "Desktop banner (wide)",
    size: "1920 × 800",
    minW: 1500,
    thumb: "h-14 w-24",
    placeholder: "/images/hero/fan-ad.jpg",
  },
  mobile: {
    label: "Mobile banner (portrait)",
    size: "750 × 1000",
    minW: 640,
    thumb: "h-14 w-14",
    placeholder: "Mobile banner for phones",
  },
};

function HeroImageSlot({
  slot,
  value,
  imgV,
  onChange,
  angle,
  pad,
  posX,
  posY,
  onAdjust,
}: {
  slot: "desktop" | "mobile";
  value: string;
  imgV: number;
  onChange: (url: string) => void;
  angle: number;
  pad: number;
  posX: number;
  posY: number;
  onAdjust: (adj: HeroAdjust) => void;
}) {
  const spec = HERO_SPEC[slot];
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
          {spec.label}
        </span>
        <span className="rounded-md bg-[#FF5A00]/10 px-2 py-0.5 text-[0.62rem] font-bold text-[#FF5A00]">
          Recommended {spec.size}px
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
        />
        <UploadButton value={value} onChange={onChange} label="Upload" />
      </div>

      <div className="mt-2 flex justify-end">
        <HeroImageAdjustModal
          value={value}
          angle={angle}
          pad={pad}
          posX={posX}
          posY={posY}
          slotLabel={spec.label}
          recommended={`${spec.size} px`}
          minWidth={spec.minW}
          onSave={(adj) => onAdjust(adj)}
        />
      </div>

      {value && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${value}-${imgV}`}
            src={`${resolveImg(value)}${
              resolveImg(value).includes("?") ? "&" : "?"
            }v=${imgV}`}
            alt="Preview"
            className={`${spec.thumb} rounded-lg border border-slate-200 bg-white object-cover`}
            onLoad={(e) => {
              const n = e.currentTarget;
              if (n.naturalWidth && n.naturalHeight)
                setSize({ w: n.naturalWidth, h: n.naturalHeight });
            }}
          />
          {size && (
            <p
              className={`mt-1 text-[0.68rem] font-semibold ${
                size.w < spec.minW ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {size.w} × {size.h} px —
              {size.w < spec.minW
                ? " smaller than recommended; will look soft/blurry when stretched. Upload a sharper, bigger image."
                : " sharp for this banner ✓"}
            </p>
          )}
        </div>
      )}
    </div>
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
  // Whole About page is edited from here (one source of truth).
  const storedAbout = (initial.about as Partial<AboutSections> | undefined) ?? {};
  // Legacy: hero title/highlight previously lived in the "inner page headings"
  // group (initial.pages.about). Seed them so the editor matches the live page.
  const legacyPg = ((initial.pages as Record<string, Record<string, string>> | undefined)?.["about"] ?? {}) as Record<string, string>;
  const aboutInit: AboutSections = {
    ...DEFAULT_ABOUT,
    ...storedAbout,
    title: storedAbout.title || legacyPg.title || DEFAULT_ABOUT.title,
    highlight: storedAbout.highlight || legacyPg.highlight || DEFAULT_ABOUT.highlight,
    mission: { ...DEFAULT_ABOUT.mission, ...(storedAbout.mission ?? {}) },
    vision: { ...DEFAULT_ABOUT.vision, ...(storedAbout.vision ?? {}) },
    approach: { ...DEFAULT_ABOUT.approach, ...(storedAbout.approach ?? {}) },
  };
  const [about, setAbout] = useState<AboutSections>(aboutInit);
  const setAboutField = <K extends keyof AboutSections>(k: K, v: AboutSections[K]) =>
    setAbout((a) => ({ ...a, [k]: v }));
  const setAboutText = (k: "title" | "highlight" | "short" | "companyHeading" | "sinceYear" | "location" | "p1" | "p2" | "image", v: string) =>
    setAbout((a) => ({ ...a, [k]: v }));
  const setMission = (k: "title" | "text", v: string) =>
    setAbout((a) => ({ ...a, mission: { ...a.mission, [k]: v } }));
  const setVision = (k: "title" | "text", v: string) =>
    setAbout((a) => ({ ...a, vision: { ...a.vision, [k]: v } }));
  const setApproach = (k: "title" | "text", v: string) =>
    setAbout((a) => ({ ...a, approach: { ...a.approach, [k]: v } }));

  const setAboutIntro = (u: string[] | ((prev: string[]) => string[])) =>
    setAbout((a) => ({ ...a, introPoints: typeof u === "function" ? u(a.introPoints) : u }));
  const setAboutValues = (u: AboutSections["values"] | ((prev: AboutSections["values"]) => AboutSections["values"])) =>
    setAbout((a) => ({ ...a, values: typeof u === "function" ? u(a.values) : u }));
  const setAboutStats = (u: AboutSections["stats"] | ((prev: AboutSections["stats"]) => AboutSections["stats"])) =>
    setAbout((a) => ({ ...a, stats: typeof u === "function" ? u(a.stats) : u }));
  const setAboutMilestones = (u: AboutSections["milestones"] | ((prev: AboutSections["milestones"]) => AboutSections["milestones"])) =>
    setAbout((a) => ({ ...a, milestones: typeof u === "function" ? u(a.milestones) : u }));
  const [galleryItems, setGallery] = useState<GalleryItem[]>(
    (initial.galleryItems as GalleryItem[] | undefined) ?? defaultGalleryItems
  );
  const [faqs, setFaqs] = useState<Faq[]>(
    (initial.faqs as Faq[] | undefined) ?? defaultFaqs
  );
  const [dealers, setDealers] = useState<Dealer[]>(
    (initial.dealers as Dealer[] | undefined) ?? defaultDealers
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
  const setGalleryItem = setList(setGallery);
  const setFaq = setList(setFaqs);
  const setDealer = setList(setDealers);
  const setAboutValue = setList(setAboutValues);
  const setAboutStat = setList(setAboutStats);
  const setAboutMilestone = setList(setAboutMilestones);

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
      about: {
        title: about.title,
        highlight: about.highlight,
        short: about.short,
        image: about.image,
        companyHeading: about.companyHeading,
        sinceYear: about.sinceYear,
        location: about.location,
        p1: about.p1,
        p2: about.p2,
        mission: about.mission,
        vision: about.vision,
        approach: about.approach,
        introPoints: about.introPoints,
        values: about.values,
        stats: about.stats,
        milestones: about.milestones,
      },
      galleryItems,
      faqs,
      dealers,
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

  const AddButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-bold text-slate-500 transition hover:border-[#FF5A00] hover:text-[#FF5A00]"
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
  const moveIntro = (i: number, d: -1 | 1) => move(setAboutIntro, i, d);
  const moveValue = (i: number, d: -1 | 1) => move(setAboutValues, i, d);
  const moveStat = (i: number, d: -1 | 1) => move(setAboutStats, i, d);
  const moveMilestone = (i: number, d: -1 | 1) => move(setAboutMilestones, i, d);
  const moveGallery = (i: number, d: -1 | 1) => move(setGallery, i, d);
  const moveFaq = (i: number, d: -1 | 1) => move(setFaqs, i, d);
  const moveDealer = (i: number, d: -1 | 1) => move(setDealers, i, d);

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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#C2410C] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF5A00]/25 transition hover:-translate-y-0.5 disabled:opacity-60"
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
      <Group title="Hero advertisement slides" hint="The big banners people see first — copy, image & buttons." accent="bg-gradient-to-r from-[#FF5A00] to-[#C2410C]" icon={FaBullhorn} count={heroSlides.length}>
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
                  <span className={isOpen ? "text-[#FF5A00]" : "text-slate-400"}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {isOpen && (
                  <div className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                      <p className="mb-2 text-[0.62rem] font-extrabold uppercase tracking-wider text-slate-500">
                        Text — show on D(esktop) / M(obile) + font size
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Offer pill (e.g. Up to 30% OFF)"><input className={input} value={s.offer ?? ""} onChange={(e) => setSlide(i, { offer: e.target.value })} /></Field>
                        <Field label="Badge"><input className={input} value={s.badge ?? ""} onChange={(e) => setSlide(i, { badge: e.target.value })} /></Field>
                        <div>
                          <Field label="Eyebrow"><input className={input} value={s.eyebrow} onChange={(e) => setSlide(i, { eyebrow: e.target.value })} /></Field>
                          <LineOpts
                            showDesktop={s.eyebrowDesktop !== false}
                            showMobile={s.eyebrowMobile !== false}
                            onDesktop={(v) => setSlide(i, { eyebrowDesktop: v })}
                            onMobile={(v) => setSlide(i, { eyebrowMobile: v })}
                            size={Number(s.eyebrowSize ?? 100)}
                            onSize={(v) => setSlide(i, { eyebrowSize: v })}
                          />
                        </div>
                        <div>
                          <Field label="Headline part 1"><input className={input} value={s.titleA} onChange={(e) => setSlide(i, { titleA: e.target.value })} /></Field>
                          <LineOpts
                            showDesktop={s.titleDesktop !== false}
                            showMobile={s.titleMobile !== false}
                            onDesktop={(v) => setSlide(i, { titleDesktop: v })}
                            onMobile={(v) => setSlide(i, { titleMobile: v })}
                            size={Number(s.titleSize ?? 100)}
                            onSize={(v) => setSlide(i, { titleSize: v })}
                          />
                        </div>
                        <div>
                          <Field label="Highlighted part"><input className={input} value={s.titleHighlight} onChange={(e) => setSlide(i, { titleHighlight: e.target.value })} /></Field>
                          <LineOpts
                            showDesktop={s.highlightDesktop !== false}
                            showMobile={s.highlightMobile !== false}
                            onDesktop={(v) => setSlide(i, { highlightDesktop: v })}
                            onMobile={(v) => setSlide(i, { highlightMobile: v })}
                            size={Number(s.highlightSize ?? 100)}
                            onSize={(v) => setSlide(i, { highlightSize: v })}
                          />
                        </div>
                        <div>
                          <Field label="Part 2 (optional)"><input className={input} value={s.titleB ?? ""} onChange={(e) => setSlide(i, { titleB: e.target.value })} /></Field>
                          <LineOpts
                            showDesktop={s.part2Desktop !== false}
                            showMobile={s.part2Mobile !== false}
                            onDesktop={(v) => setSlide(i, { part2Desktop: v })}
                            onMobile={(v) => setSlide(i, { part2Mobile: v })}
                            size={Number(s.part2Size ?? 100)}
                            onSize={(v) => setSlide(i, { part2Size: v })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Field label="Description"><textarea rows={2} className={`${input} resize-none`} value={s.description} onChange={(e) => setSlide(i, { description: e.target.value })} /></Field>
                          <LineOpts
                            showDesktop={s.descDesktop !== false}
                            showMobile={s.descMobile !== false}
                            onDesktop={(v) => setSlide(i, { descDesktop: v })}
                            onMobile={(v) => setSlide(i, { descMobile: v })}
                            size={Number(s.descSize ?? 100)}
                            onSize={(v) => setSlide(i, { descSize: v })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                      <p className="mb-2 text-[0.62rem] font-extrabold uppercase tracking-wider text-slate-500">
                        Buttons
                      </p>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {[
                          {
                            n: 1,
                            label: "Button 1 · Primary",
                            text: s.ctaLabel,
                            onText: (v: string) => setSlide(i, { ctaLabel: v }),
                            link: s.ctaHref,
                            onLink: (v: string) => setSlide(i, { ctaHref: v }),
                            showDesktop: s.showCta1Desktop !== false,
                            onDesktop: (v: boolean) => setSlide(i, { showCta1Desktop: v }),
                            showMobile: s.showCta1Mobile !== false,
                            onMobile: (v: boolean) => setSlide(i, { showCta1Mobile: v }),
                            size: Number(s.cta1Size ?? 14),
                            onSize: (v: number) => setSlide(i, { cta1Size: v }),
                          },
                          {
                            n: 2,
                            label: "Button 2 · Secondary (optional)",
                            text: s.cta2Label,
                            onText: (v: string) => setSlide(i, { cta2Label: v }),
                            link: s.cta2Href,
                            onLink: (v: string) => setSlide(i, { cta2Href: v }),
                            showDesktop: s.showCta2Desktop !== false,
                            onDesktop: (v: boolean) => setSlide(i, { showCta2Desktop: v }),
                            showMobile: s.showCta2Mobile !== false,
                            onMobile: (v: boolean) => setSlide(i, { showCta2Mobile: v }),
                            size: Number(s.cta2Size ?? 14),
                            onSize: (v: number) => setSlide(i, { cta2Size: v }),
                          },
                        ].map((b) => (
                          <div
                            key={b.n}
                            className="rounded-xl border border-slate-200 bg-white p-3"
                          >
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                              {b.label}
                            </p>
                            <Field label="Text">
                              <input
                                className={input}
                                value={b.text}
                                onChange={(e) => b.onText(e.target.value)}
                              />
                            </Field>
                            <div className="mt-2">
                              <Field label="Link">
                                <input
                                  className={input}
                                  value={b.link}
                                  onChange={(e) => b.onLink(e.target.value)}
                                  placeholder="/products?category=fans"
                                />
                              </Field>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-[#FF5A00]"
                                  checked={b.showDesktop}
                                  onChange={(e) => b.onDesktop(e.target.checked)}
                                />
                                Show on desktop
                              </label>
                              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-[#FF5A00]"
                                  checked={b.showMobile}
                                  onChange={(e) => b.onMobile(e.target.checked)}
                                />
                                Show on mobile
                              </label>
                            </div>
                            <div className="mt-2">
                              <NumStepper
                                label="Font size"
                                value={b.size}
                                min={12}
                                max={24}
                                step={1}
                                unit="px"
                                onChange={b.onSize}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="space-y-3">
                        <HeroImageSlot
                          slot="desktop"
                          value={s.image}
                          imgV={imgV}
                          angle={Number(s.imgAngle ?? 0)}
                          pad={Number(s.imgPadding ?? 0)}
                          posX={Number(s.imgPosX ?? 50)}
                          posY={Number(s.imgPosY ?? 50)}
                          onChange={(url) => {
                            setSlide(i, { image: url });
                            setImgV((v) => v + 1);
                          }}
                          onAdjust={(adj) => {
                            setSlide(i, {
                              image: adj.image,
                              imgAngle: adj.angle,
                              imgPadding: adj.pad,
                              imgPosX: adj.posX,
                              imgPosY: adj.posY,
                            });
                            setImgV((v) => v + 1);
                          }}
                        />
                        <HeroImageSlot
                          slot="mobile"
                          value={s.imageMobile ?? ""}
                          imgV={imgV}
                          angle={Number(s.imgAngle ?? 0)}
                          pad={Number(s.imgPadding ?? 0)}
                          posX={Number(s.imgPosX ?? 50)}
                          posY={Number(s.imgPosY ?? 50)}
                          onChange={(url) => {
                            setSlide(i, { imageMobile: url });
                            setImgV((v) => v + 1);
                          }}
                          onAdjust={(adj) => {
                            setSlide(i, {
                              imageMobile: adj.image,
                              imgAngle: adj.angle,
                              imgPadding: adj.pad,
                              imgPosX: adj.posX,
                              imgPosY: adj.posY,
                            });
                            setImgV((v) => v + 1);
                          }}
                        />
                        <p className="text-[0.7rem] leading-relaxed text-slate-500">
                          Desktop banner fills the wide slider on computers; the
                          mobile banner is shown on phones so you can frame each
                          screen properly. Use sharp originals (JPEG / PNG /
                          WebP — not screenshots) at the recommended sizes to
                          avoid blur.
                        </p>
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
                  offer: "",
                  eyebrow: "",
                  titleA: "Headline",
                  titleHighlight: "highlight",
                  titleB: "",
                  description: "",
                  ctaLabel: "Shop Now",
                  ctaHref: "/products",
                  cta2Label: "",
                  cta2Href: "",
                  showCta1Desktop: true,
                  showCta1Mobile: true,
                  cta1Size: 14,
                  showCta2Desktop: true,
                  showCta2Mobile: true,
                  cta2Size: 14,
                  eyebrowDesktop: true,
                  eyebrowMobile: true,
                  eyebrowSize: 100,
                  titleDesktop: true,
                  titleMobile: true,
                  titleSize: 100,
                  highlightDesktop: true,
                  highlightMobile: true,
                  highlightSize: 100,
                  part2Desktop: true,
                  part2Mobile: true,
                  part2Size: 100,
                  descDesktop: true,
                  descMobile: true,
                  descSize: 100,
                  image: "/images/hero/fan-ad.jpg",
                  imageMobile: "",
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
      <Group title="Trust strip (USPs)" hint="The small benefit cards above the category tiles." accent="bg-gradient-to-r from-[#002B6B] to-[#0047B3]" icon={FaCheckCircle} count={trust.length}>
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
      <Group title="Slogan banner (mid-page)" hint="The full-width message between sections." accent="bg-gradient-to-r from-[#0047B3] to-[#001B45]" icon={FaQuoteRight} count={1}>
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
      <Group title="Why Choose tiles" hint="The 4 reasons shown near the bottom of the homepage." accent="bg-gradient-to-r from-[#FF5A00] to-[#E04D00]" icon={FaThumbsUp} count={why.length}>
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
      <Group title="Promo / collection banners" hint="Image banners linking to a category or page." accent="bg-gradient-to-r from-[#0047B3] to-[#002B6B]" icon={FaImages} count={promos.length}>
        <div className="space-y-3">
          {promos.map((p, i) => (
            <ItemRow key={i} label={p.title} onRemove={() => removeAt(setPromos)(i)}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={input} value={p.title} onChange={(e) => setPromo(i, { title: e.target.value })} placeholder="Title" />
                <input className={input} value={p.link} onChange={(e) => setPromo(i, { link: e.target.value })} placeholder="/products?category=…" />
                <input className={input} value={p.subtitle ?? ""} onChange={(e) => setPromo(i, { subtitle: e.target.value })} placeholder="Subtitle" />
              </div>
              <SmallImageUpload
                value={p.image ?? ""}
                onChange={(url) => setPromo(i, { image: url })}
                recommended="1200 × 800"
                minW={900}
              />
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
      <Group title="Testimonials" hint="Customer reviews shown in the blue carousel." accent="bg-gradient-to-r from-[#FF7A1A] to-[#E04D00]" icon={FaCommentDots} count={testimonials.length}>
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

      {/* ============ ABOUT PAGE ============ */}
      <Group
        title="About page — full content"
        hint="Edit every section of the About page from here: hero heading, image, story, mission, values, stats & timeline."
        accent="bg-gradient-to-r from-[#002B6B] to-[#0047B3]"
        icon={FaInfoCircle}
        count={7}
      >
        {/* 1 · Hero */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Hero heading (top banner)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className={lbl}>Heading</span>
              <input className={input} value={about.title} onChange={(e) => setAboutText("title", e.target.value)} placeholder="e.g. Peshawar's Most" />
            </label>
            <label className="block">
              <span className={lbl}>Highlighted word (gold)</span>
              <input className={input} value={about.highlight} onChange={(e) => setAboutText("highlight", e.target.value)} placeholder="e.g. Trusted Electric Shop" />
            </label>
          </div>
          <div className="mt-2">
            <label className="block">
              <span className={lbl}>Short description under hero</span>
              <textarea rows={2} className={`${input} resize-none`} value={about.short} onChange={(e) => setAboutText("short", e.target.value)} />
            </label>
          </div>
        </div>

        {/* 2 · Company profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Company profile (story)
          </p>
          <div className="space-y-2">
            <label className="block">
              <span className={lbl}>Shop / company name heading</span>
              <input className={input} value={about.companyHeading} onChange={(e) => setAboutText("companyHeading", e.target.value)} placeholder="e.g. Respak Express" />
            </label>
            <label className="block">
              <span className={lbl}>Shop front image</span>
              <SmallImageUpload value={about.image} onChange={(url) => setAboutText("image", url)} recommended="1600 × 1000" minW={1200} />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className={lbl}>Established year (badge + heading)</span>
                <input className={input} value={about.sinceYear} onChange={(e) => setAboutText("sinceYear", e.target.value)} placeholder="e.g. 2015" />
              </label>
              <label className="block">
                <span className={lbl}>Location (badge under “Since”)</span>
                <input className={input} value={about.location} onChange={(e) => setAboutText("location", e.target.value)} placeholder="e.g. Peshawar, Pakistan" />
              </label>
            </div>
            <label className="block">
              <span className={lbl}>Paragraph 1</span>
              <textarea rows={3} className={`${input} resize-none`} value={about.p1} onChange={(e) => setAboutText("p1", e.target.value)} />
            </label>
            <label className="block">
              <span className={lbl}>Paragraph 2</span>
              <textarea rows={3} className={`${input} resize-none`} value={about.p2} onChange={(e) => setAboutText("p2", e.target.value)} />
            </label>
          </div>
        </div>

        {/* 3 · Mission / Vision / Approach */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Mission · Vision · Approach cards
          </p>
          <div className="space-y-3">
            {(
              [
                { key: "mission", state: about.mission, set: setMission, name: "Mission" },
                { key: "vision", state: about.vision, set: setVision, name: "Vision" },
                { key: "approach", state: about.approach, set: setApproach, name: "Approach" },
              ] as const
            ).map((c) => (
              <div key={c.key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={input} value={c.state.title} onChange={(e) => c.set("title", e.target.value)} placeholder={`${c.name} title`} />
                  <textarea rows={2} className={`${input} resize-none sm:col-span-2`} value={c.state.text} onChange={(e) => c.set("text", e.target.value)} placeholder={`${c.name} text`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 · Intro points */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Intro points (bullets under the story)</p>
          <div className="space-y-2">
            {about.introPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea rows={1} className={`${input} resize-none`} value={p} onChange={(e) => setAboutIntro((l) => l.map((x, xi) => (xi === i ? e.target.value : x)))} />
                <ItemControls i={i} len={about.introPoints.length} onRemove={() => removeAt(setAboutIntro)(i)} moveFn={(d) => moveIntro(i, d)} />
              </div>
            ))}
          </div>
          <AddButton label="Add intro point" onClick={() => pushAt<string>(setAboutIntro, "")} />
        </div>

        {/* 5 · Core values */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Core values</p>
          <div className="space-y-2">
            {about.values.map((v, i) => (
              <ItemRow key={i} label={v.title} controls={<ItemControls i={i} len={about.values.length} onRemove={() => removeAt(setAboutValues)(i)} moveFn={(d) => moveValue(i, d)} />}>
                <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
                  <IconPick value={v.icon} onChange={(x) => setAboutValue(i, { icon: x })} />
                  <input className={input} value={v.title} onChange={(e) => setAboutValue(i, { title: e.target.value })} placeholder="Title" />
                  <textarea rows={2} className={`${input} resize-none sm:col-span-2`} value={v.text} onChange={(e) => setAboutValue(i, { text: e.target.value })} placeholder="Short description" />
                </div>
              </ItemRow>
            ))}
          </div>
          <AddButton label="Add value" onClick={() => pushAt(setAboutValues, { icon: "shield", title: "New value", text: "" })} />
        </div>

        {/* 6 · Stats band */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Stats band (numbers)</p>
          <div className="space-y-2">
            {about.stats.map((s, i) => (
              <ItemRow key={i} label={`${s.value}${s.suffix} ${s.label}`} controls={<ItemControls i={i} len={about.stats.length} onRemove={() => removeAt(setAboutStats)(i)} moveFn={(d) => moveStat(i, d)} />}>
                <div className="grid gap-2 sm:grid-cols-[6rem_5rem_1fr]">
                  <input type="number" className={input} value={s.value} onChange={(e) => setAboutStat(i, { value: Number(e.target.value) || 0 })} />
                  <input className={input} value={s.suffix} onChange={(e) => setAboutStat(i, { suffix: e.target.value })} placeholder="+ " />
                  <input className={input} value={s.label} onChange={(e) => setAboutStat(i, { label: e.target.value })} placeholder="Label" />
                </div>
              </ItemRow>
            ))}
          </div>
          <AddButton label="Add stat" onClick={() => pushAt(setAboutStats, { value: 0, suffix: "+", label: "New stat" })} />
        </div>

        {/* 7 · Milestones */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">History timeline (milestones)</p>
          <div className="space-y-2">
            {about.milestones.map((m, i) => (
              <ItemRow key={i} label={`${m.year} — ${m.title}`} controls={<ItemControls i={i} len={about.milestones.length} onRemove={() => removeAt(setAboutMilestones)(i)} moveFn={(d) => moveMilestone(i, d)} />}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={input} value={m.year} onChange={(e) => setAboutMilestone(i, { year: e.target.value })} placeholder="Year / label" />
                  <input className={input} value={m.title} onChange={(e) => setAboutMilestone(i, { title: e.target.value })} placeholder="Title" />
                  <textarea rows={2} className={`${input} resize-none sm:col-span-2`} value={m.text} onChange={(e) => setAboutMilestone(i, { text: e.target.value })} placeholder="Description" />
                </div>
              </ItemRow>
            ))}
          </div>
          <AddButton label="Add milestone" onClick={() => pushAt(setAboutMilestones, { year: "", title: "New milestone", text: "" })} />
        </div>
      </Group>

      {/* ============ GALLERY ============ */}
      <Group title="Gallery photos" hint="Real project photos with captions — shown on the Gallery page." accent="bg-gradient-to-r from-[#FF5A00] to-[#C2410C]" icon={FaImages} count={galleryItems.length}>
        <div className="space-y-3">
          {galleryItems.map((g, i) => (
            <ItemRow key={g.id} label={g.title} controls={<ItemControls i={i} len={galleryItems.length} onRemove={() => removeAt(setGallery)(i)} moveFn={(d) => moveGallery(i, d)} />}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={input} value={g.title} onChange={(e) => setGalleryItem(i, { title: e.target.value })} placeholder="Title" />
                <input className={input} value={g.category} onChange={(e) => setGalleryItem(i, { category: e.target.value })} placeholder="Category (e.g. Fans)" />
                <input className={input} value={g.location} onChange={(e) => setGalleryItem(i, { location: e.target.value })} placeholder="Location" />
                <div className="flex items-center gap-2">
                  <input className={input} value={g.image} onChange={(e) => setGalleryItem(i, { image: e.target.value })} placeholder="/images/gallery/…" />
                  <UploadButton value={g.image} onChange={(url) => setGalleryItem(i, { image: url })} label="Upload" />
                </div>
              </div>
              {g.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${g.image}-${imgV}`} src={`${resolveImg(g.image)}${resolveImg(g.image).includes("?") ? "&" : "?"}v=${imgV}`} alt={g.title} className="mt-2 h-16 w-28 rounded-lg border border-slate-200 bg-white object-cover" />
              )}
            </ItemRow>
          ))}
          <AddButton label="Add photo" onClick={() => pushAt(setGallery, { id: `g-${Date.now()}`, title: "New photo", category: "Fans", location: "Peshawar", image: "" })} />
        </div>
      </Group>

      {/* ============ SUPPORT FAQ ============ */}
      <Group title="Support FAQs" hint="Questions & answers on the Support page (categories: warranty / products / orders / support)." accent="bg-gradient-to-r from-[#0047B3] to-[#1E5CB3]" icon={FaQuestionCircle} count={faqs.length}>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <ItemRow key={f.id} label={f.question} controls={<ItemControls i={i} len={faqs.length} onRemove={() => removeAt(setFaqs)(i)} moveFn={(d) => moveFaq(i, d)} />}>
              <div className="grid gap-2 sm:grid-cols-[9rem_1fr]">
                <select className={input} value={f.category} onChange={(e) => setFaq(i, { category: e.target.value as Faq["category"] })}>
                  {["warranty", "products", "orders", "support"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input className={input} value={f.question} onChange={(e) => setFaq(i, { question: e.target.value })} placeholder="Question" />
                <textarea rows={2} className={`${input} resize-none sm:col-span-2`} value={f.answer} onChange={(e) => setFaq(i, { answer: e.target.value })} placeholder="Answer" />
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add FAQ" onClick={() => pushAt(setFaqs, { id: `f-${Date.now()}`, category: "support", question: "", answer: "" } as Faq)} />
        </div>
      </Group>

      {/* ============ DEALERS ============ */}
      <Group title="Dealers & locations" hint="Outlets shown on the Dealers page." accent="bg-gradient-to-r from-[#FF7A1A] to-[#E04D00]" icon={FaStore} count={dealers.length}>
        <div className="space-y-3">
          {dealers.map((d, i) => (
            <ItemRow key={d.id} label={d.name} controls={<ItemControls i={i} len={dealers.length} onRemove={() => removeAt(setDealers)(i)} moveFn={(d2) => moveDealer(i, d2)} />}>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={input} value={d.name} onChange={(e) => setDealer(i, { name: e.target.value })} placeholder="Name" />
                <input className={input} value={d.city} onChange={(e) => setDealer(i, { city: e.target.value })} placeholder="City" />
                <input className={input} value={d.area} onChange={(e) => setDealer(i, { area: e.target.value })} placeholder="Area / market" />
                <input className={input} value={d.phone} onChange={(e) => setDealer(i, { phone: e.target.value })} placeholder="Phone" />
                <input className={`${input} sm:col-span-2`} value={d.address} onChange={(e) => setDealer(i, { address: e.target.value })} placeholder="Full address" />
                <input className={input} value={d.timing} onChange={(e) => setDealer(i, { timing: e.target.value })} placeholder="Timing" />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input type="checkbox" className="h-4 w-4 accent-[#FF5A00]" checked={d.isServiceCenter} onChange={(e) => setDealer(i, { isServiceCenter: e.target.checked })} /> Service center
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <input type="checkbox" className="h-4 w-4 accent-[#FF5A00]" checked={d.isHeadOffice} onChange={(e) => setDealer(i, { isHeadOffice: e.target.checked })} /> Head office
                  </label>
                </div>
              </div>
            </ItemRow>
          ))}
          <AddButton label="Add dealer" onClick={() => pushAt(setDealers, { id: `d-${Date.now()}`, name: "New outlet", city: "Peshawar", area: "", address: "", phone: "", timing: "", isServiceCenter: true, isHeadOffice: false } as Dealer)} />
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
            <Field label="Phone"><input className={input} value={siteInfo.phone ?? ""} onChange={(e) => setInfo("phone", e.target.value)} placeholder="+92 345 9398834" /></Field>
            <Field label="Email"><input className={input} value={siteInfo.email ?? ""} onChange={(e) => setInfo("email", e.target.value)} placeholder="info@respakexpress.pk" /></Field>
            <Field label="Hours"><input className={input} value={siteInfo.hours ?? ""} onChange={(e) => setInfo("hours", e.target.value)} placeholder="Mon-Sat: 9:00 AM - 8:00 PM" /></Field>
            <Field label="WhatsApp number"><input className={input} value={siteInfo.whatsapp ?? ""} onChange={(e) => setInfo("whatsapp", e.target.value)} placeholder="923459398834" /></Field>
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
        hint="Main heading + highlighted word for Contact, Support, Gallery & Dealers. (About is edited in the About page group above.)"
        accent="bg-gradient-to-r from-[#E04D00] to-[#C2410C]"
        icon={FaFileAlt}
        count={4}
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

function ItemRow({ label, onRemove, controls, children }: { label: string; onRemove?: () => void; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-slate-700">{label || "New item"}</span>
        {controls ?? (onRemove ? (
          <button type="button" onClick={onRemove} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Remove">
            <FaTrash />
          </button>
        ) : null)}
      </div>
      {children}
    </div>
  );
}

// ItemControls helper that also wires move (defined inline in code above to reuse move fns)

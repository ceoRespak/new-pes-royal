import "server-only";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { HeroSlide } from "@/data/hero";

/**
 * Local site-content overrides (this site). If a section is left empty here,
 * the site renders its built-in defaults, so nothing breaks until the user
 * customizes it in Admin → Site Content.
 *
 * File: /.data/site-content.json (gitignored, not served).
 */

export interface SiteInfo {
  phone?: string;
  email?: string;
  hours?: string;
  address?: string;
  whatsapp?: string;
  footerAbout?: string;
  announcement?: string;
}

export interface PageText {
  title?: string;
  highlight?: string;
}

export interface SiteContent {
  heroSlides?: HeroSlide[];
  siteInfo?: SiteInfo;
  pages?: {
    about?: PageText;
    contact?: PageText;
    support?: PageText;
    gallery?: PageText;
    dealers?: PageText;
  };
  trustStrip?: { icon: string; title: string; text: string }[];
  slogan?: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  whyChoose?: {
    heading?: string;
    items?: { icon: string; title: string; text: string }[];
  };
  promoBanners?: { title: string; subtitle?: string; image?: string; link: string }[];
  testimonials?: {
    id: string;
    quote: string;
    rating: number;
    initials: string;
    name: string;
    role: string;
    city: string;
  }[];
  /** About page — fully editable content (fall back to built-in defaults). */
  about?: {
    /** Hero heading + gold highlight word. */
    title?: string;
    highlight?: string;
    /** Short line under the hero (the “hero description”). */
    short?: string;
    /** Company-profile main image (shop front). */
    image?: string;
    /** “Company Profile” intro heading (first line above the paragraphs). */
    companyHeading?: string;
    /** Company Profile paragraphs. */
    p1?: string;
    p2?: string;
    /** Mission / Vision / Approach cards. */
    mission?: { title?: string; text?: string };
    vision?: { title?: string; text?: string };
    approach?: { title?: string; text?: string };
    introPoints?: string[];
    values?: { icon: string; title: string; text: string }[];
    stats?: { value: number; suffix: string; label: string }[];
    milestones?: { year: string; title: string; text: string }[];
  };
  /** Gallery photo entries. */
  galleryItems?: {
    id: string;
    title: string;
    category: string;
    location: string;
    image: string;
  }[];
  /** Support page FAQs. */
  faqs?: {
    id: string;
    category: string;
    question: string;
    answer: string;
  }[];
  /** Dealers & locations. */
  dealers?: {
    id: string;
    name: string;
    city: string;
    area: string;
    address: string;
    phone: string;
    timing: string;
    isServiceCenter: boolean;
    isHeadOffice: boolean;
  }[];
  updatedAt?: number;
  // more sections to come (header/footer, inner pages…)
  [key: string]: unknown;
}

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "site-content.json");

export function getContent(): SiteContent {
  if (!existsSync(FILE)) return {};
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as SiteContent;
  } catch {
    return {};
  }
}

/** Deep-ish merge: arrays and plain objects replace when provided. */
export function saveContent(patch: Record<string, unknown>): SiteContent {
  const current = getContent();
  const next: Record<string, unknown> = { ...current };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      current[k] &&
      typeof current[k] === "object" &&
      !Array.isArray(current[k])
    ) {
      next[k] = { ...(current[k] as object), ...(v as object) };
    } else {
      next[k] = v;
    }
  }
  mkdirSync(DIR, { recursive: true });
  next.updatedAt = Date.now();
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

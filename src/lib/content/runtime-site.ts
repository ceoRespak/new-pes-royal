import "server-only";
import { site as defaults } from "@/data/site";
import { getContent } from "@/lib/content/store";
import { getSettingsStore } from "@/lib/catalog/store";

/**
 * Effective / runtime site settings for the STOREFRONT.
 *
 * The storefront's static copy lives in `src/data/site.ts` (SEO-safe defaults
 * used at build time). The **Admin → Live Store Settings** panel edits the
 * runtime `/.data/store.json` → `settings` object. Nothing on the public site
 * read that object, which is why edits had "no impact".
 *
 * This module is the bridge: it returns the live, per-request settings with
 * priority  runtime store settings  >  Site Content (siteInfo)  >  static site.
 * Only server components/layouts may call it (it reads files); client leaves
 * receive the same values through <SiteProvider> (see components/site).
 */

export interface RuntimeSite {
  name: string;
  shortName: string;
  shopName: string;
  tagline: string;
  description: string;
  logo: string;
  shopFront?: string;
  phone: string;
  contactPhone: string;
  whatsapp: string; // digits only, e.g. "923459398834" (for wa.me links)
  email: string;
  salesEmail: string;
  address: string;
  contactAddress: string;
  hours: string;
  hoursWeekdays: string;
  hoursSunday: string;
  hoursFriday: string;
  social: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  socialLinks: { name: string; url: string; icon?: string }[];
  about: {
    heading: string;
    headingHighlight: string;
    short: string;
    p1: string;
    p2: string;
  };
  returnPolicy: string;
  deliveryInfo: string;
  whatsappMessage: string;
  mapEmbed: string;
  promoBanners: { title: string; subtitle?: string; image?: string; link: string; color?: string }[];
  footerAbout?: string;
  footerTagline?: string;
  copyright?: string;
  announcement?: string;
}

const str = (v: unknown): string => {
  const t = typeof v === "string" ? v.trim() : "";
  return t === "" ? "" : t;
};
const digits = (v: unknown): string => str(v).replace(/\D/g, "");

/** Parse a JSON-encoded array/object string (legacy store strings). */
function arrOf<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") {
    const t = v.trim();
    if (t.startsWith("[")) {
      try {
        const p = JSON.parse(t);
        if (Array.isArray(p)) return p as T[];
      } catch {
        /* ignore */
      }
    }
  }
  return [];
}

export function getRuntimeSite(): RuntimeSite {
  const d = defaults as unknown as RuntimeSite;
  const content = getContent();
  const ci = (content.siteInfo ?? {}) as Record<string, string | undefined>;
  const store = (getSettingsStore() ?? {}) as Record<string, unknown>;

  /* ---- layer 1: static defaults ----
     (spread into a fresh object so we never mutate the `as const` import) */
  const s: RuntimeSite = {
    ...d,
    about: { ...d.about },
    social: { ...d.social },
    socialLinks: d.socialLinks.map((l) => ({ ...l })),
    promoBanners: (d.promoBanners || []).map((b) => ({ ...b })),
  };

  /* ---- layer 2: Site Content → siteInfo ----
     (what the old "Site Content → contact" editor wrote) */
  const info = (k: string, fallback: string): string => {
    const v = str(ci[k]);
    return v || fallback;
  };
  s.phone = info("phone", s.phone);
  s.email = info("email", s.email);
  s.address = info("address", s.address);
  s.hours = info("hours", s.hours) || info("workingHours", s.hours);
  const ciWa = info("whatsapp", "");
  if (ciWa) s.whatsapp = digits(ciWa) || s.whatsapp;
  s.footerAbout = info("footerAbout", "") || s.footerAbout;

  /* ---- layer 3: Live Store Settings (top priority) ---- */
  const pick = (k: string, fallback: string): string => {
    const v = str(store[k]);
    return v || fallback;
  };

  const siteName = pick("siteName", s.name);
  s.name = siteName;
  s.shopName = pick("shopName", siteName);
  s.shortName = siteName;
  s.description = pick("siteDescription", s.description);
  s.phone = pick("phone", s.phone);
  s.contactPhone = pick("contactPhone", s.contactPhone);
  s.email = pick("email", s.email);
  s.salesEmail = pick("contactEmail", s.salesEmail);
  s.address = pick("address", s.address);
  s.contactAddress = pick("contactAddress", s.contactAddress);

  const waRaw = digits(store["whatsappNumber"] || store["whatsapp"]);
  if (waRaw) s.whatsapp = waRaw;
  else {
    const ph = digits(s.phone);
    if (ph) s.whatsapp = ph;
  }
  s.whatsapp = s.whatsapp.replace(/^0/, "92"); // 03xx → 923xx

  s.hours = pick("workingHours", s.hours);
  s.hoursWeekdays = pick("hoursWeekdays", s.hoursWeekdays);
  s.hoursSunday = pick("hoursSunday", s.hoursSunday);
  s.hoursFriday = pick("hoursFriday", s.hoursFriday);

  const fbTag = pick("footerTagline", "");
  if (fbTag) s.footerTagline = fbTag;
  const fbDesc = pick("footerDescription", "");
  if (fbDesc) s.footerAbout = fbDesc;
  const copy = pick("footerCopyright", "");
  if (copy) s.copyright = copy;

  s.about.heading = pick("aboutHeading", s.about.heading);
  s.about.headingHighlight = pick("aboutHeadingHighlight", s.about.headingHighlight);
  s.about.short = pick("aboutUs", s.about.short);
  s.about.p1 = pick("aboutDescription1", s.about.p1);
  s.about.p2 = pick("aboutDescription2", s.about.p2);

  s.returnPolicy = pick("returnPolicy", s.returnPolicy);
  s.deliveryInfo = pick("deliveryInfo", s.deliveryInfo);
  s.whatsappMessage = pick("whatsappMessage", s.whatsappMessage);

  const promo = arrOf<RuntimeSite["promoBanners"][number]>(store["promoBanners"]);
  if (promo.length) {
    // Rewrite legacy `/storage/images/…` → this site's own `/api/files/…`
    // (same uploaded file, different mount) so banners never 404.
    s.promoBanners = promo.map((b) => ({
      ...b,
      link: b.link || "/products",
      // Rewrite legacy `/storage/images/…` → this site's own `/api/files/…`
      // (same uploaded file, different mount) so banners never 404.
      image: (b.image || "").replace(/^\/storage\/images\//, "/api/files/"),
    }));
  } else {
    const contentPromo = (content.promoBanners as RuntimeSite["promoBanners"] | undefined) || [];
    if (contentPromo.length) {
      s.promoBanners = contentPromo.map((b) => ({ ...b, link: b.link || "/products" }));
    }
  }

  const socials = arrOf<{ name: string; url: string; icon?: string }>(store["socialLinks"]);
  if (socials.length) {
    s.socialLinks = socials;
    const social: RuntimeSite["social"] = {};
    for (const l of socials) {
      const n = (l.name || "").toLowerCase();
      if (!l.url) continue;
      if (n.includes("facebook")) social.facebook = l.url;
      else if (n.includes("whatsapp")) social.whatsapp = l.url;
      else if (n.includes("instagram")) social.instagram = l.url;
      else if (n.includes("youtube")) social.youtube = l.url;
      else if (n.includes("linkedin")) social.linkedin = l.url;
      else if (n.includes("twitter") || n.includes("x")) social.twitter = l.url;
    }
    s.social = { ...d.social, ...social };
  }

  return s;
}

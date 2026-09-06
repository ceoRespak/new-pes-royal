export interface HeroFeature {
  icon: string;
  label: string;
}

export interface HeroSlide {
  id: string;
  /** Optional small badge above the eyebrow, e.g. "★ Best Seller". */
  badge?: string;
  eyebrow: string;
  titleA: string;
  titleHighlight: string;
  titleB?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label?: string;
  cta2Href?: string;
  /** Path to the banner/product image (put your own ads in /public/images/hero). */
  image: string;
  imageAlt: string;
  /** Icon + short claim chips shown under the copy. Icons: bolt, sun, star,
   *  shield, truck, wifi, award, headset, check, store. */
  features: HeroFeature[];
  bg: string;
}

/**
 * HERO SLIDES — the homepage's main advertisement carousel.
 *
 * To use YOUR OWN ad banners:
 *   1. Drop your image file in  public/images/hero/   (e.g. fan-ad.jpg)
 *   2. Point `image` at it, e.g. image: "/images/hero/my-ad.jpg"
 *   3. Optionally edit the headline / copy / link for that slide.
 * No code knowledge needed beyond editing this one file.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "s1-welcome",
    badge: "Respak Express · Peshawar",
    eyebrow: "Shop #1 Haroon Market, Karkhano Bazar",
    titleA: "Bringing Light to",
    titleHighlight: "Every Home.",
    description:
      "Since 2015 Respak Express has been Peshawar's trusted electrical store — genuine fans, LED lighting, switches, cables & smart home solutions from Pakistan's leading brands, at fair prices.",
    ctaLabel: "Shop the Store",
    ctaHref: "/products",
    cta2Label: "Our Story",
    cta2Href: "/about",
    image: "/images/hero/fan-ad.jpg",
    imageAlt: "Quality electrical products at Respak Express, Peshawar",
    features: [
      { icon: "store", label: "In-store at Karkhano" },
      { icon: "award", label: "Leading brands" },
      { icon: "shield", label: "100% genuine" },
      { icon: "truck", label: "Same-day in Peshawar" },
    ],
    bg: "radial-gradient(1200px 620px at 85% -10%, rgba(26,92,173,0.5), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 58%,#0a4788 100%)",
  },
  {
    id: "s2-distributor",
    badge: "Authorized Distributor",
    eyebrow: "Pakistan Cables · AGE · Fast · Philips · Schneider · ABB",
    titleA: "Approved Distributor of",
    titleHighlight: "the Brands You Trust.",
    description:
      "We are an approved distributor of Pakistan Cables, AGE and Fast Cables, and stock genuine Philips, Schneider, ABB, Opal, Royal, Voldam and Pak Fan — every item carries its official warranty.",
    ctaLabel: "Browse Products",
    ctaHref: "/products",
    cta2Label: "Talk to an Expert",
    cta2Href: "/contact",
    image: "/images/hero/light-ad.jpg",
    imageAlt: "Approved distributor of leading electrical brands at Respak Express",
    features: [
      { icon: "shield", label: "Official warranty" },
      { icon: "award", label: "Authorized dealer" },
      { icon: "check", label: "Approved distributor" },
      { icon: "headset", label: "Expert advice" },
    ],
    bg: "radial-gradient(1200px 620px at 15% -10%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(120deg,#141428 0%,#003366 55%,#0a4788 100%)",
  },
  {
    id: "s3-ecommerce",
    badge: "Shop Online",
    eyebrow: "COD · Bank transfer · Nationwide delivery",
    titleA: "Order Online.",
    titleHighlight: "Delivered to Your Door.",
    description:
      "Browse the full catalogue online, order in minutes and pay cash on delivery or by bank transfer — with free same-day delivery across Peshawar and fast courier service nationwide.",
    ctaLabel: "Start Shopping",
    ctaHref: "/products",
    cta2Label: "Order on WhatsApp",
    cta2Href: "https://wa.me/923459398834?text=Hello%20Respak%20Express!%20I%20would%20like%20to%20ask%20about%20your%20products.",
    image: "/images/hero/smart-ad.jpg",
    imageAlt: "Shop online with Respak Express — cash on delivery nationwide",
    features: [
      { icon: "truck", label: "Same-day delivery" },
      { icon: "check", label: "Cash on Delivery" },
      { icon: "shield", label: "Secure ordering" },
      { icon: "headset", label: "Expert support" },
    ],
    bg: "radial-gradient(1200px 620px at 80% 0%, rgba(26,92,173,0.55), transparent 60%), linear-gradient(120deg,#00244a 0%,#003366 55%,#0a4788 100%)",
  },
];

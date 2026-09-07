export interface HeroFeature {
  icon: string;
  label: string;
}

export interface HeroSlide {
  id: string;
  /** Optional small badge above the eyebrow, e.g. "★ Best Seller". */
  badge?: string;
  /** Optional short promo/offer pill, e.g. "Up to 30% OFF" (e-commerce hero). */
  offer?: string;
  /** Text size % (70–150). Default 100 — admin adjustable. */
  textScale?: number;
  /** Banner image rotation in degrees (−30..30). Default 0 — admin adjustable. */
  imgAngle?: number;
  /** Banner image inset/padding in px (0 = full-bleed). Default 0 — admin adjustable. */
  imgPadding?: number;
  /** Banner image horizontal position 0–100 (default 50 = centre). */
  imgPosX?: number;
  /** Banner image vertical position 0–100 (0 = top, 100 = bottom, 50 = centre). */
  imgPosY?: number;
  /** Hide the headline/buttons/copy on MOBILE (<768px) — show only the banner. */
  hideTextMobile?: boolean;
  eyebrow: string;
  titleA: string;
  titleHighlight: string;
  titleB?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label?: string;
  cta2Href?: string;
  /** Show/hide each button on Desktop / Mobile (default both = true). */
  showCta1Desktop?: boolean;
  showCta1Mobile?: boolean;
  showCta2Desktop?: boolean;
  showCta2Mobile?: boolean;
  /** Button font size in px (default 14). */
  cta1Size?: number;
  cta2Size?: number;
  /** Text lines: show/hide per device (default true) + font size % (default 100). */
  eyebrowDesktop?: boolean;
  eyebrowMobile?: boolean;
  eyebrowSize?: number;
  titleDesktop?: boolean;
  titleMobile?: boolean;
  titleSize?: number;
  highlightDesktop?: boolean;
  highlightMobile?: boolean;
  highlightSize?: number;
  part2Desktop?: boolean;
  part2Mobile?: boolean;
  part2Size?: number;
  descDesktop?: boolean;
  descMobile?: boolean;
  descSize?: number;
  /** Desktop banner image (wide, e.g. 1920×800 — /public/images/hero or upload). */
  image: string;
  /** Optional MOBILE banner image (portrait, e.g. 750×1000). Falls back to `image`. */
  imageMobile?: string;
  imageAlt: string;
  /** Icon + short claim chips shown under the copy. Icons: bolt, sun, star,
   *  shield, truck, wifi, award, headset, check, store. */
  features: HeroFeature[];
  bg: string;
}

/**
 * HERO SLIDES — Powerhouse-style E-COMMERCE promo carousel.
 *
 * Each slide promotes a collection / offer: sale headline + offer pill
 * ("Up to 30% OFF"), a product visual and a "Shop Now" CTA to a category.
 *
 * To use YOUR OWN banner/ad image:
 *   1. Drop your image file in  public/images/hero/   (e.g. fan-ad.jpg)
 *   2. Point `image` at it, e.g. image: "/images/hero/my-ad.jpg"
 *   3. Optionally edit the offer / headline / copy / CTA for that slide.
 * No code knowledge needed beyond editing this one file.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "s1-fans",
    offer: "Up to 20% OFF",
    badge: "Fans Collection",
    eyebrow: "Royal · Voldam · Pak Fan · Lahore Fan",
    titleA: "Beat the Heat with",
    titleHighlight: "Premium Ceiling Fans.",
    description:
      "Genuine ceiling, bracket and exhaust fans from Pakistan's leading brands — official warranty, same-day delivery in Peshawar and Cash on Delivery nationwide.",
    ctaLabel: "Shop Fans",
    ctaHref: "/products?category=fan",
    cta2Label: "Browse All",
    cta2Href: "/products",
    image: "/images/hero/fan-ad.jpg",
    imageAlt: "Premium ceiling fans at Respak Express",
    features: [
      { icon: "truck", label: "Same-day delivery" },
      { icon: "shield", label: "Official warranty" },
      { icon: "check", label: "Cash on Delivery" },
    ],
    bg: "radial-gradient(1200px 620px at 85% -10%, rgba(26,92,173,0.5), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 58%,#0a4788 100%)",
  },
  {
    id: "s2-lighting",
    offer: "New Season LEDs",
    badge: "Lighting Solutions",
    eyebrow: "LED Bulbs · Panels · Downlights · Deco",
    titleA: "Light Up Your Space with",
    titleHighlight: "Energy-Saving LED.",
    description:
      "Bright, durable and power-friendly lighting for homes, shops and offices — genuine Philips, SMD and decorative ranges at fair prices.",
    ctaLabel: "Shop Lighting",
    ctaHref: "/products?category=lighting-solutions",
    cta2Label: "View All Products",
    cta2Href: "/products",
    image: "/images/hero/light-ad.jpg",
    imageAlt: "Energy-saving LED lighting range at Respak Express",
    features: [
      { icon: "bolt", label: "Energy saving" },
      { icon: "shield", label: "1-year warranty" },
      { icon: "truck", label: "Fast delivery" },
    ],
    bg: "radial-gradient(1200px 620px at 15% -10%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(120deg,#141428 0%,#003366 55%,#0a4788 100%)",
  },
  {
    id: "s3-smarthome",
    offer: "Smart Living",
    badge: "New Arrivals",
    eyebrow: "BlueDot Smart Home",
    titleA: "Make Your Home",
    titleHighlight: "Smarter.",
    description:
      "Wi-Fi smart switches, sockets, dimmers and sensors — control your home from your phone. Order online with Cash on Delivery or bank transfer, delivered to your door.",
    ctaLabel: "Shop Smart Home",
    ctaHref: "/products?category=smart-home",
    cta2Label: "Order on WhatsApp",
    cta2Href: "https://wa.me/923459398834?text=Hello%20Respak%20Express!%20I%20would%20like%20to%20ask%20about%20your%20products.",
    image: "/images/hero/smart-ad.jpg",
    imageAlt: "BlueDot smart home switches at Respak Express",
    features: [
      { icon: "wifi", label: "Wi-Fi enabled" },
      { icon: "shield", label: "Genuine BlueDot" },
      { icon: "check", label: "Easy checkout" },
    ],
    bg: "radial-gradient(1200px 620px at 80% 0%, rgba(26,92,173,0.55), transparent 60%), linear-gradient(120deg,#00244a 0%,#003366 55%,#0a4788 100%)",
  },
];

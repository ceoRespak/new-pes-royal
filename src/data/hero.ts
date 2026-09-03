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
    id: "s1-fans",
    badge: "Best Sellers",
    eyebrow: "Ceiling · Bracket · Exhaust Fans",
    titleA: "Beat the Heat.",
    titleHighlight: "Cut the Bill.",
    description:
      "Energy-efficient ceiling, bracket and exhaust fans from Royal, Pak Fan & more — pure copper motors, quiet airflow and real warranties at honest prices.",
    ctaLabel: "Shop Fans",
    ctaHref: "/products?category=fan",
    cta2Label: "Explore All",
    cta2Href: "/products",
    image: "/images/hero/fan-ad.jpg",
    imageAlt: "Genuine ceiling fan at Pearl Electric Solutions",
    features: [
      { icon: "bolt", label: "Energy saving" },
      { icon: "star", label: "Copper motor" },
      { icon: "shield", label: "Genuine warranty" },
      { icon: "truck", label: "Fast delivery" },
    ],
    bg: "radial-gradient(1200px 620px at 85% -10%, rgba(26,92,173,0.5), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 58%,#0a4788 100%)",
  },
  {
    id: "s2-lighting",
    badge: "Up to 90% Saving",
    eyebrow: "LED · Panels · Floodlights",
    titleA: "Brighter Rooms,",
    titleHighlight: "Lower Bills.",
    description:
      "Switch to energy-saving LED lighting from Philips, Opal and leading brands — bulbs, battens, panels and floodlights that light up your space for less.",
    ctaLabel: "Shop LED Lights",
    ctaHref: "/products?category=lighting-solutions",
    cta2Label: "View All",
    cta2Href: "/products",
    image: "/images/hero/light-ad.jpg",
    imageAlt: "Energy-saving LED downlights at Pearl Electric Solutions",
    features: [
      { icon: "bolt", label: "Up to 90% saving" },
      { icon: "sun", label: "Warm & bright" },
      { icon: "award", label: "Trusted brands" },
      { icon: "check", label: "Long life LED" },
    ],
    bg: "radial-gradient(1200px 620px at 15% -10%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(120deg,#141428 0%,#003366 55%,#0a4788 100%)",
  },
  {
    id: "s3-smart",
    badge: "New Season",
    eyebrow: "Smart Home · BlueDot · Protection",
    titleA: "Smart Control,",
    titleHighlight: "Safe & Simple.",
    description:
      "Automate your home with genuine BlueDot WiFi switches and sensors — plus trusted breakers, DBs and protection gear that keep every circuit safe.",
    ctaLabel: "Shop Smart Home",
    ctaHref: "/products?category=smart-home",
    cta2Label: "Talk to Us",
    cta2Href: "/contact",
    image: "/images/hero/smart-ad.jpg",
    imageAlt: "BlueDot smart touch switch at Pearl Electric Solutions",
    features: [
      { icon: "wifi", label: "WiFi switches" },
      { icon: "bolt", label: "Circuit protection" },
      { icon: "shield", label: "100% genuine" },
      { icon: "headset", label: "Expert setup" },
    ],
    bg: "radial-gradient(1200px 620px at 80% 0%, rgba(26,92,173,0.55), transparent 60%), linear-gradient(120deg,#00244a 0%,#003366 55%,#0a4788 100%)",
  },
];

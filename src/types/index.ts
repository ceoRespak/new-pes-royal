/* ============================================================
   Pearl Electric Solutions (PES) — Domain types
   ============================================================ */

export interface NavLink {
  label: string;
  href: string;
}

/** Category identifier — matches the real store categories (see data/categories.ts). */
export type Category = string;

export interface DownloadFile {
  label: string;
  url: string;
  size: string;
}

/** A purchasable option for a product (stored locally — the live backend's
 *  product_variants table can't persist them, so this site owns them). */
export interface ProductVariant {
  id?: string;
  label: string;
  price?: string | number;
  salePrice?: string | number;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Price in PKR */
  price: number;
  salePrice?: number;
  tagline: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  images: string[];
  downloads: DownloadFile[];
  badge?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  inStock: boolean;
  rating: number;
  reviews: number;
  warranty: string;
  variants?: ProductVariant[];
}

export interface CategoryMeta {
  id: Category;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  count: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
  initials: string;
}

export interface Faq {
  id: string;
  category: "warranty" | "orders" | "products" | "support";
  question: string;
  answer: string;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  timing: string;
  isServiceCenter: boolean;
  isHeadOffice: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location: string;
  image: string;
}

export interface ServiceCenter {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  timing: string;
}

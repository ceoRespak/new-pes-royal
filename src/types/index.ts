/* ============================================================
   Respak Express — Domain types
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

/** A purchasable option for a product (site-owned, stored in /.data/variants.json). */
export interface ProductVariant {
  id?: string;
  label: string;
  price?: string | number;
  salePrice?: string | number;
  image?: string;
}

/** A brochure / datasheet file shown on the product page. */
export interface ProductDownload {
  label: string;
  url: string;
  size?: string;
}

/** A product video — either a self-hosted file url or an external link. */
export interface ProductVideo {
  label?: string;
  /** Self-hosted file (e.g. /api/files/demo.mp4) to embed in a <video>. */
  url?: string;
  /** External link (YouTube / Vimeo / any url). */  link?: string;
}

/** Auto-detected brand reference (family). */
export interface BrandRef {
  id: string;
  name: string;
}

/** Auto-assigned sub-category (product type inside its category). */
export interface SubCategoryRef {
  id: string;
  name: string;
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
  downloads: ProductDownload[];
  /** Product videos (file +/or external link). */
  videos?: ProductVideo[];
  badge?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  inStock: boolean;
  rating: number;
  reviews: number;
  warranty: string;
  variants?: ProductVariant[];
  /** Auto-detected brand (family) from the product name. */
  brand?: BrandRef;
  /** Detected brand product-line (e.g. "Opal Premium") when available. */
  brandLine?: string;
  /** Auto-assigned sub-category (product type within its category). */
  sub?: SubCategoryRef;
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

/* ============================================================
   E-commerce — cart / checkout / orders
   ============================================================ */

/** A product line kept in the shopper's cart (client-side). */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  /** e.g. "Standard", "Premium" — empty string for products without variants. */
  variantLabel?: string;
  /** Effective unit price in PKR (honours sale/variant price). */
  unitPrice: number;
  /** Regular (non-sale) unit price, for strikethrough display. */
  regularPrice?: number;
  qty: number;
}

export type ShippingMethodId = "peshawar" | "nationwide";

export type PaymentMethodId =
  | "cod"
  | "bank"
  | "jazzcash"
  | "easypaisa"
  | "card";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
}

export interface Order {
  ref: string;
  createdAt: string;
  customer: OrderCustomer;
  shippingMethod: ShippingMethodId;
  shippingLabel: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethodId;
  paymentLabel: string;
  paymentStatus: PaymentStatus;
  /** Lifecycle of the order (managed from the admin panel). */
  status: OrderStatus;
  /** Audit trail of status changes. */
  history?: { at: string; to: OrderStatus; by?: string }[];
}

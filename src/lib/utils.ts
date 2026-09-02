/** Tiny classname combiner (clsx-style). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a number as PKR price, e.g. 12500 -> "Rs 12,500". */
export function formatPrice(value: number, currency = "Rs"): string {
  return `${currency} ${value.toLocaleString("en-PK")}`;
}

/** Discount percent between regular price and sale price. */
export function discountPercent(price: number, salePrice?: number): number | null {
  if (!salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

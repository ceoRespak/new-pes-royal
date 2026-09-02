import type { MetadataRoute } from "next";
import { products } from "@/data/products";

const BASE = "https://pearlelectric.pk";

const staticRoutes = [
  "",
  "/products",
  "/about",
  "/contact",
  "/support",
  "/gallery",
  "/dealers",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const productRoutes = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...productRoutes,
  ];
}

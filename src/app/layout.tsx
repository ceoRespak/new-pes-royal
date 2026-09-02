import type { Metadata, Viewport } from "next";
import { inter, poppins } from "@/lib/fonts";
import { site } from "@/data/site";
import "./globals.css";

const SITE_URL = "https://pearlelectric.pk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} (PES) | ${site.tagline}`,
    template: `%s | ${site.name} (PES)`,
  },
  description: site.description,
  keywords: [
    "Pearl Electric Solutions",
    "PES",
    "ceiling fans Pakistan",
    "LED lights Pakistan",
    "motion sensors",
    "electrical accessories",
    "fans Peshawar",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: site.name,
    title: `${site.name} (PES) | ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/og/og-image.svg",
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} (PES) | ${site.tagline}`,
    description: site.description,
    images: ["/og/og-image.svg"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

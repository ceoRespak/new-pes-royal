# Pearl Electric Solutions (PES) — Official Website

A complete, modern, premium marketing & product website for **Pearl Electric
Solutions (PES)** built with **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS**, **Framer Motion** and **Swiper.js**.

The visual language (clean + royal-blue + gold, product-first layout, smooth
reveal animations, sticky transparent→solid header) is inspired by modern
premium e‑commerce brands like royalfans.com — **without copying any of their
code, copy or imagery**.

---

## ✨ Features

- **8 pages** — Home, Products (grid + filters), Product Detail (gallery, specs,
  features, downloads), About (mission/vision/timeline + animated counters),
  Contact (form + Google Map), Support (warranty, FAQ, service centres,
  downloads), Gallery (filterable + lightbox) and Dealers (searchable network).
- **Sticky animated navbar** — transparent over the hero → solid white on
  scroll; categories dropdown; animated mobile drawer.
- **Hero slider** (Swiper.js) with 3 brand slides + floating rating cards.
- **Framer Motion** scroll reveals, staggered product grids and animated
  counters.
- **Product catalogue** with live search, category chips & sorting.
- **WhatsApp floating chat** button + WhatsApp “order / enquiry” deep links on
  every product.
- **Lazy-loaded images**, premium SEO metadata (title templates, OpenGraph,
  Twitter cards, JSON‑LD‑ready sitemap/robots).
- **Downloadable PDF** spec sheets & warranty policy.
- Fully **mobile responsive**, custom fonts (Poppins + Inter via
  `next/font`).

---

## 🧱 Tech stack

| Tool              | Version |
| ----------------- | ------- |
| Next.js (App Router) | 14.2.x |
| React             | 18.3.x |
| TypeScript        | 5.x |
| Tailwind CSS      | 3.4.x |
| Framer Motion     | 11.x |
| Swiper            | 11.x |
| React Icons       | 5.x |

---

## 🚀 Getting started

```bash
# 1. install dependencies
npm install

# 2. (optional) refresh the real data / PDFs / decorative art
node scripts/import-pes.mjs            # real catalog from scripts/pes-data/*.json
node scripts/generate-store-pdfs.mjs   # store PDFs (catalogue, returns, brands)
node scripts/generate-images.mjs       # decorative placeholder art

# 3. run the dev server
npm run dev
```

Open **http://localhost:3000** — the site is ready to browse.

Production build / preview:

```bash
npm run build
npm start
```

---

## � Admin panel

A password-protected admin lives at **`/admin`** (outside the marketing layout).

- **Sign in** — `http://localhost:3000/admin/login` with the local admin password
  (env `ADMIN_PASSWORD`, set it in `.env.local` — see `.env.example`). Sessions
  are signed HMAC cookies.
- **Pages** — Dashboard (live store overview), Products (add/edit/delete),
  Categories, and Site & Banners (contact, about, return policy, promo banners,
  social links).
- **Where edits go** — every save is written **to the live pespeshawar.pk
  backend** through a server-side proxy (`src/lib/admin/backend.ts`) that
  authenticates as the existing PES admin (Sanctum) and handles CSRF/CORS. Reads
  need no credentials; **writes** need:

  ```bash
  # .env.local  (see .env.example — real values NOT committed)
  ADMIN_PASSWORD=<your-local-admin-password>
  PES_API_BASE=https://api.pespeshawar.pk
  PES_ADMIN_USERNAME=admin   # live API logs in with `username`
  PES_ADMIN_PASSWORD=<live-pes-backend-password>
  ```

  API route handlers are in `src/app/api/admin/**`. Product updates go to
  `PUT /api/products` and category updates to `PUT /api/categories` (id in the
  body) — those are the routes the live Laravel backend actually exposes.
  **Variants are stored locally** in `public/data/variants.json` because the
  live backend’s `product_variants` table can’t persist them (see
  `src/lib/admin/variants-store.ts`); the public product page reads that file
  live, so variants you add appear immediately.
- **Refresh this site's static preview** after live edits:
  `node scripts/import-pes.mjs` then restart dev/build.

---

## �📁 Folder structure

```
.
├── public/
│   ├── logo.svg / favicon.svg            # brand assets
│   ├── og/og-image.svg                   # OpenGraph share image
│   ├── images/                           # decorative SVG placeholder art
│   └── downloads/*.pdf                   # store price catalogue, returns, brands
├── scripts/
│   ├── import-pes.mjs                    # real-data importer (from scripts/pes-data/*.json)
│   ├── generate-store-pdfs.mjs           # real store PDF generator
│   ├── generate-images.mjs               # deterministic decorative SVG art generator
│   └── pes-data/*.json                   # API snapshots of www.pespeshawar.pk
└── src/
    ├── app/                              # App Router pages
    │   ├── layout.tsx / globals.css      # root layout + Tailwind
    │   ├── page.tsx                      # Home
    │   ├── products/page.tsx             # Product listing
    │   ├── products/[slug]/page.tsx      # Product detail (+related)
    │   ├── about/ contact/ support/
    │   ├── gallery/ dealers/
    │   ├── not-found.tsx sitemap.ts robots.ts
    ├── components/
    │   ├── layout/   Navbar, Footer, Logo, WhatsAppButton, NewsletterForm
    │   ├── home/     HeroSlider, CategoryCards, ProductShowcase,
    │   │             BrandStory, TestimonialsSlider, PromoBanners,
    │   │             TrustStrip, CtaSection
    │   ├── products/ ProductCard, ProductsGrid, ProductCategorySection,
    │   │             ProductCatalog, ProductSpecsTable, ImageGallery,
    │   │             ProductBuyPanel
    │   ├── ui/       AnimatedSectionWrapper, AnimatedCounter,
    │   │             SectionHeading, PageHero, RatingStars
    │   └── ContactForm, FaqAccordion, GalleryGrid, DealerDirectory
    ├── data/         products.ts, categories.ts, site.ts, testimonials.ts,
    │                 faqs.ts, dealers.ts, gallery.ts
    ├── lib/          utils.ts (formatPrice/cn), fonts.ts
    └── types/        shared TypeScript domain types
```

---

## 🗂 Real data — imported from www.pespeshawar.pk

This site is populated with the **real Pearl Electric Solutions catalog** from
www.pespeshawar.pk (fetched via its public API on 2026‑09‑02):

- **100 products** across the store's **13 real categories** (FAN, Exhaust
  Fans, Lighting Solutions, Wires & Cables, Switches & Sockets, Circuit
  Breakers, Distribution Boards (DBs), Solar Accessories, Smart Home,
  Conduites & Back Boxes, Shutters & Covers, Earthing Accessories, Others).
- Real product photos are **hotlinked** from `https://api.pespeshawar.pk`
  (they load from the live backend — keep it online).
- Real contact info, phone/WhatsApp, email, hours, socials, promo banners,
  both shop addresses and brand story.

To refresh from the live site later:

```bash
# 1. snapshot the API responses into scripts/pes-data/
#    (products.json = /api/products, categories.json = /api/categories,
#     settings.json = /api/settings)
# 2. regenerate data + PDFs
node scripts/import-pes.mjs
node scripts/generate-store-pdfs.mjs
```

The mapper lives in `scripts/import-pes.mjs` and always regenerates:

- **Products** → `src/data/products.ts`
- **Real categories** → `src/data/categories.ts`
- **Contact / branding / promos** → `src/data/site.ts`
- **PDFs** → `public/downloads/` (price catalogue, returns & delivery, brands)

> The live `/api/products` endpoint currently returns the same 100 products on
> every page (no true pagination), so 100 is the full public catalog. Product
> descriptions are often just the title — the UI therefore hides empty
> Features/Specs/Downloads sections and shows an honest “confirm on WhatsApp”
> helper instead of inventing data.

## 🗂 Where to change things

- **Products** → `src/data/products.ts` (100 real products; regenerate with
  `node scripts/import-pes.mjs`).
- **Categories** → `src/data/categories.ts` (13 real categories + counts).
- **Contact / branding** → `src/data/site.ts` (phone, WhatsApp, email,
  addresses, hours, socials, promo banners, about text, map embed).
- **Dealers / Locations** → `src/data/dealers.ts` (both Peshawar shops).
- **FAQs / Gallery / Testimonials** → `src/data/*.ts`.
- **Colours / fonts** → `tailwind.config.ts` + `src/app/globals.css`
  (`--primary: #003366`, `--accent: #D4AF37`, `--light: #F5F5F5`).
- **Decorative placeholder art** (hero visuals, gallery tiles) → generated
  SVGs under `public/images/` via `scripts/generate-images.mjs`.

> `next.config.mjs` disables image optimisation (`images.unoptimized`) so both
> the local SVG placeholders **and** the hotlinked product photos are served
> directly and reliably.

---

## ✅ Checklist vs. the brief

- [x] Next.js 14 App Router · Tailwind · TypeScript · Framer Motion ·
      Swiper · React Icons · SEO/OG metadata
- [x] Premium white + royal blue + gold theme, large hero, fade/slide-in
      animations, sticky transparent→solid header, hover product cards,
      category browsing, modern multi-column footer
- [x] Home · Products · Product Detail · About · Contact (map embed) ·
      Support · Gallery · Dealers — all wired to real data
- [x] Navbar, Footer, HeroSlider, ProductCard, ProductCategorySection,
      AnimatedSectionWrapper, TestimonialsSlider, ContactForm,
      ProductSpecsTable, ImageGallery
- [x] `src/data/products.ts` with id / name / category / price / images[] /
      features[] / specs{} / downloads[]
- [x] PES logo placeholder + brand palette
- [x] Mobile responsive · lazy images · smooth scroll · animated counters ·
      PDF downloads · WhatsApp floating button

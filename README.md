# Respak Express — Official Website & Store

A modern e‑commerce site for **Respak Express** (electrical goods store,
Peshawar) built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind
CSS**, **Framer Motion** and **Swiper.js**.

The site is **fully self‑hosted** — products, categories, settings, orders,
variants and uploaded images all live on this site. There is **no external
backend**.

---

## ✨ Features

- **Storefront** — home (hero, categories, collection rows, featured / best
  sellers), full product listing with search, sort, category chips, **price
  filter** and **Load‑more pagination**, dense responsive grids, product
  detail pages.
- **Shopping** — client‑side cart (localStorage), checkout with Cash on
  Delivery / Bank Transfer (gateway seam for JazzCash/Easypaisa/card),
  order confirmation pages and WhatsApp ordering alongside the cart.
- **Admin** at `/admin` — Dashboard, Products, **Orders**, Categories,
  Site Content, Settings, Users. All edits are stored locally.
- WhatsApp floating chat + per‑product WhatsApp buttons.
- Premium SEO (metadata, sitemap, robots), lazy‑loaded images, fully mobile
  responsive.

## 🧱 Tech stack

| Tool           | Version   |
| -------------- | --------- |
| Next.js        | 14.2.x    |
| React          | 18.3.x    |
| TypeScript     | 5.x       |
| Tailwind CSS   | 3.4.x     |
| Framer Motion  | 11.x      |
| Swiper         | 11.x      |

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local     # set ADMIN_PASSWORD + ADMIN_SESSION_SECRET
npm run dev                    # http://localhost:3000
```

Optional — re‑seed products/categories/settings + images from the old data
(one‑time, only if the local store is empty):

```bash
npm run migrate:own            # scripts/own-backend-migrate.mjs
```

Other tooling: `npm run generate:pdfs` (store PDFs), `npm run build` / `start`.

## � Self-hosted data (no external backend)

Everything is stored by this site under `/.data/` (gitignored, not served):

| What                | Where                                    |
| ------------------- | ---------------------------------------- |
| Products + categories + settings | `/.data/store.json` (`src/lib/catalog/store.ts`) |
| Product / upload images | `/.data/uploads/` served at `/api/files/<name>` |
| Orders              | `/.data/orders.json` (`src/lib/orders/store.ts`) |
| Product variants    | `/.data/variants.json` (`src/lib/admin/variants-store.ts`) |
| Admin users         | `/.data/admin-users.json` |
| Site content overrides | `/.data/site-content.json` (`src/lib/content/store.ts`) |

- Admin reads/writes go through a **local data layer**
  (`src/lib/admin/backend.ts`) — same API as before, but backed by the store.
- Storefront pages read the same store via `src/lib/store/live.ts`.
- `resolveImage()` (`src/lib/images.ts`) resolves legacy/self-hosted image
  references to `/api/files/...`.
- `src/data/*.ts` now serve only as **display/fallback** helpers; the
  authoritative catalog is the local store.

> ⚠️ **Deploy note:** `/.data/` is not in the GitHub build artifact. After
> deploying, either run `node scripts/own-backend-migrate.mjs` on the server or
> upload this machine’s `/.data/` folder (store.json + uploads) to the app root.

## � Order confirmations (email + WhatsApp)

When a customer places an order we send:

- **Email** — full confirmation + order details, automatically to the customer
  (if they gave an email) and a copy to the store inbox. Powered by SMTP via
  `nodemailer`. Configure in `.env.local` (see `.env.example`):

  ```
  SMTP_HOST=…        SMTP_PORT=465        SMTP_SECURE=true
  SMTP_USER=…        SMTP_PASS=…
  SMTP_FROM=…                          # optional
  ORDER_EMAILS_TO=info@respakexpress.pk  # owner inbox(es), comma separated
  ```

  No SMTP set → emails are skipped (checkout still works; the server logs it).

- **WhatsApp** — two layers:
  - *Automated (optional):* WhatsApp **Business Cloud API** — when an order is
    placed it sends the customer an approved template with order ref + total and
    **Confirm / Cancel** buttons (like powerhouseexpress). A webhook
    (`/api/whatsapp/webhook`) receives the button tap and updates the order.
    Configure via `WA_BUSINESS_TOKEN`, `WA_PHONE_ID`, `WA_VERIFY_TOKEN`,
    `WA_ORDER_TEMPLATE` — see `docs/WHATSAPP_BUSINESS_SETUP.md`. Inactive until
    those are set.
  - *Fallback (always available):* the order-confirmation page builds a
    ready-made **wa.me** message with the full order recap to send the details
    to the store number in one tap.

- **Payments today:** Cash on Delivery + Bank Transfer (with bank details shown
  at checkout and on the confirmation page). Online gateways (JazzCash /
  Easypaisa / card) are disabled placeholders in
  `src/lib/checkout/config.ts` until merchant accounts are added.

## 👤 Customer accounts (login / my account)

Storefront login like powerhouseexpress — optional but makes repeat ordering
one-tap:

- **Register / login** at `/login` (email + password). A 30‑day signed cookie
  (`respak_customer_session`) keeps the visitor signed in. Guest checkout still
  works with no account.
- Customers can **save their name / phone / city / address** on `/account`.
- At **checkout**, signed-in customers have the form auto‑filled from their
  saved profile and can tick "Save this address to my account" so next order is
  even faster.
- Orders placed while signed in are **linked to the account** and listed with
  their status on `/account` → each row links to the full order page (email +
  WhatsApp confirmations behave the same as for guests).
- Accounts + hashed passwords live in `/.data/customers.json` (gitignored).
  Configure the signing secret with `CUSTOMER_SESSION_SECRET` in `.env.local`
  (falls back to `ADMIN_SESSION_SECRET`).


## �🗂 Folder structure (highlights)

```
public/images, downloads      # art + generated PDFs (product images NOT here)
.data/                        # runtime store (gitignored)
scripts/
  own-backend-migrate.mjs     # seed store + self-host images (npm run migrate:own)
  generate-store-pdfs.mjs     # store PDF generator
  generate-images.mjs         # decorative SVG art
  pes-data/                   # legacy snapshots used by the PDF generator
src/
  app/
    (site)/                   # Home, Products, Cart, Checkout, Order/[ref],
                              #   About, Contact, Support, Gallery, Dealers
    admin/                    # Admin (panel + auth)
    api/
      admin/**                # admin CRUD (local store)
      orders/                 # public order placement
      files/[name]            # self-hosted image files
      shop/categories         # category feed for the navbar menu
  components/
    layout/  home/  products/ admin/  cart/  ui/
  lib/
    catalog/store.ts          # products/categories/settings (JSON store)
    orders/store.ts           # orders
    admin/backend.ts          # local data layer used by admin routes
    admin/variants-store.ts   # local variants
    admin/users-store.ts      # local admin users
    content/store.ts          # local site-content overrides
    store/live.ts             # storefront catalog loader
    checkout/config.ts        # shipping/payment/bank rules
    images.ts                 # image resolver
  data/                       # display defaults / fallbacks
  types/                      # shared domain types
```

## 🗂 Where to change things

- **Products / Categories / Settings** → Admin panel (stored in
  `/.data/store.json`).
- **Orders** → Admin → Orders.
- **Shipping fees / payment methods / bank details** →
  `src/lib/checkout/config.ts` (activate JazzCash/Easypaisa/card here).
- **Contact / branding / socials / hours** → `src/data/site.ts` + Admin →
  Site Content.
- **Colours / fonts** → `tailwind.config.ts` + `src/app/globals.css`
  (`--primary: #003366`, `--accent: #D4AF37`).
- **Decorative art** → `public/images/` via `scripts/generate-images.mjs`.

> `next.config.mjs` disables image optimisation (`images.unoptimized`) so
> locally-served `/api/files/...` images are delivered directly.

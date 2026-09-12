# PhoneLaptops.co.ke — Your Trusted Technology Store

Latest Tech. Honest Prices. Delivered.

Production-grade Kenyan electronics e-commerce: Next.js 14 + TypeScript + Prisma + PostgreSQL + M-Pesa Daraja + NextAuth.

## Quick start

```bash
cp .env.example .env        # set DATABASE_URL + MPESA_* + NEXTAUTH_SECRET + ADMIN_EMAIL/PASSWORD
npm install
npx prisma migrate dev      # create tables (production: prisma migrate deploy)
npm run prisma:seed         # catalog, categories, brands, zones, category ads, promo codes, admin user
npm run dev                 # http://localhost:3000
```

## Deploy (Vercel + Postgres)

1. Set env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `MPESA_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Every deploy auto-runs `prisma migrate deploy` + `prisma db seed` (see `vercel.json`). The seed is idempotent and never overwrites admin edits (prices, stock, flags, ads, promos, settings, passwords) — it only creates missing rows. If you set a custom Build Command in the Vercel dashboard it overrides `vercel.json`: either clear it or paste the same command there.
3. Sign in at `/admin/login` with the seeded email + password, then change the password.

**Admin console:** Overview, Products (+ `/new`, full `/[id]` edit), Orders (+ `/[orderNumber]` detail), Customers (+ `/[id]`), Promotions, Ads & Banners (+ `/[id]`), Reviews, Analytics, and Settings — site identity/contacts (header, footer, WhatsApp), password change, delivery zones. All `/admin/*` pages require login via middleware; mutation APIs verify the session server-side.

Product content (catalog, images, specs, SEO) lives in `src/data/catalog.ts` and is seeded into Postgres; the storefront reads the database first and degrades gracefully when offline. No demo data is served — catalog APIs return live rows, mutation and promo endpoints fail closed without a database.

## Structure

- `src/app/` — homepage (17 sections), `[category]/` shop + `[slug]/` PDP with JSON-LD, search, cart, checkout, order-confirmation, track-order, compare, wishlist, account, admin, info pages, sitemap/robots
- `src/components/` — Header, Footer, ProductCard, ShopClient filters, ProductDetailClient, home sections, toasts
- `src/data/catalog.ts` — 33 products across 10 categories (laptops, desktops, iphones, smartphones, tablets, storage, laptop-bags, laptop-parts, accessories, gaming) with KES pricing, rich-text descriptions, specs, SEO copy, reviews
- `src/lib/` — prisma, auth (NextAuth), mpesa (Daraja STK), seo, stores (zustand cart/wishlist/compare), utils
- `prisma/schema.prisma` — catalog / inventory / customers / orders / payments / promos / reviews / delivery zones
- `src/app/api/` — products, search, orders, mpesa stk+callback, promo validate, reviews, admin stats

## Key flows

- **Buy Now** (`/checkout?buy=slug`) → order → M-Pesa STK push (simulated in sandbox) → `/order-confirmation?order=PL-…`
- **Promo codes:** `TECH10` (10% off 10k+), `FLAT500` (KES 500 off 5k+)
- **WhatsApp:** floating button + per-product deep links with name/price/URL
- **WhatsApp:** floating button (official glyph) + per-product deep links with name/price/URL — number `0715 135 141` (`NEXT_PUBLIC_WHATSAPP_NUMBER=254715135141`); socials `@phonelaptopske` on Facebook/Instagram/X/YouTube/TikTok
- **Ad slots:** full-width image banners above breadcrumbs on PDP + category pages, between homepage sections (`below-hero`, `below-deals`, `above-footer`), and SQUARE ads in the product sidebar — targeted GLOBAL/HOMEPAGE/CATEGORY/PRODUCT via the `AdSlot` model and `/api/ads`, managed in `/admin` → Ads & Banners
- **Admin:** multi-page console under `/admin` — Overview, Products (list + `/new` + full `/[id]` edit: details, gallery, specs, flags, danger zone), Orders (list + `/[orderNumber]` detail with fulfilment controls), Customers (list + `/[id]` profile & history), Promotions (codes CRUD), Ads & Banners (list + full `/[id]` edit: targeting, format, priority, schedule), Reviews (approve/reject/delete), Analytics, Settings (delivery zones). Guard with NextAuth `role=ADMIN` before public exposure.
- **Uploads:** `POST /api/uploads` (JPG/PNG/WebP/AVIF/GIF, ≤5MB) stores to `public/uploads/` — used by the product gallery, new-product form and ad creatives. Self-hosted safe; swap for S3/Cloudinary on serverless.
- **Marketing:** email capture (`Newsletter` model + `/api/newsletter`) via homepage form and a session-gated 10%-off popup revealing TECH10; PDP share buttons (WhatsApp/X/Facebook/copy); subscriber list + CSV export at `/admin/marketing`.
- **SEO:** per-product meta/canonical/OG + Product/Breadcrumb JSON-LD, Organization + WebSite (+SearchAction) schema, FAQ schema, Article schema on `/guides` buying guides (laptops + iPhones Kenya), `sitemap.xml`, and `llms.txt` machine-readable catalog digest.
- **AI assistant:** floating Tech Advisor chat (`/api/ai/ask`) — OpenAI when `OPENAI_API_KEY` is set, otherwise a built-in zero-cost Kenyan-tech engine (budget parsing, use-case scoring, service answers) with product cards.

## Deploy

Vercel + Neon/Supabase Postgres. Set env vars, run `prisma migrate deploy`, `prisma db seed`.

# Ad Creative Specs — PhoneLaptops.co.ke

Where ads appear and the exact sizes users see. Create creatives to these dimensions.

## WIDE banners

Shown above the breadcrumb on product + category + blog + guide pages,
and between homepage sections (`below-hero`, `below-deals`, `above-footer`).

| Device  | Displayed size   |
| ------- | ---------------- |
| Desktop | ≈ 1216 × 176 px  |
| Tablet  | ≈ 720 × 144 px   |
| Phone   | ≈ 343 × 112 px   |
| **Design at** | **1920 × 400 px** (JPG, ~200–400 KB) |

## SQUARE ads

Shown in sidebars (two stacked): below “Still deciding?” on product pages,
and in the sidebar on blog articles and buying guides.

| Device  | Displayed size   |
| ------- | ---------------- |
| Desktop | ≈ 360 × 360 px   |
| Phone (2 side-by-side) | ≈ 165 × 165 px |
| **Design at** | **1080 × 1080 px** (JPG, ~150–300 KB) |

## Design rules

1. **WIDE crops vertically** — the same file renders 176 px tall on desktop but
   112 px on phones (`object-cover`). Keep all text and logos inside the
   **vertical center band**; treat the top and bottom ~25% as bleed that will
   be cut on some screens.
2. **SQUARE never distorts** — always 1:1, just scaled. Center the subject with
   ~10% padding so nothing touches the rounded corners.
3. **Text size** — WIDE headlines must read at 112 px tall on phones: use bold
   type at 90 px or larger (at 1920 px wide). If small text is essential, use
   the SQUARE format instead.
4. **Weight** — keep files under ~400 KB (TinyPNG / Squoosh) so banners don't
   slow the page. Banners lazy-load, but light files still win.
5. **Safe formats** — JPG for photos, PNG only when you need transparency.

## Publishing (admin)

/admin → **Ads & Banners** → **New ad**:

- **Shows on** — GLOBAL (everywhere), HOMEPAGE (section), CATEGORY, PRODUCT, BLOG or GUIDES.
- **Target** — `below-hero` / `below-deals` / `above-footer` for homepage,
  a category slug (e.g. `laptops`), product slug, blog slug (or `blog` for the
  index), guide slug (or `guides` for the index) — or `all`. Suggestions appear
  as you type; matching ignores case.
- **Inheritance** — products automatically show their parent category's banners
  (wide above the breadcrumb, square in the sidebar) unless a product-specific
  ad outranks them. Priority order: exact product → category → global.
- **Rotation** — when several ads share the winning tier for a slot, visitors
  are split across them (stable per visitor via an anonymous browser id, so
  one shopper consistently sees the same creative while different shoppers
  see different ones). Priority still wins: a lone exact-match ad always shows
  first; rotation only shares its tier. Stacked sidebar slots show different
  creatives from the same rotation. Verify splits in **Performance** and
  preview any visitor with the slot tester's visitor-id field.
- **Priority** — lowest number wins when several ads match the same slot.
- Exact matches beat wildcards (`all`), which beat GLOBAL.
- Use **Pause** instead of delete for seasonal creatives you will reuse.
- **Images must load** — the new/edit form checks the creative URL before
  publishing (and the API re-checks on save). Prefer uploading; external
  hotlinks rot. **Live slot previews** on the Ads page show every key slot
  as shoppers see it — a broken badge there means fix that creative.
- **Performance** — every render and click is counted. The report flags
  live ads with zero impressions (nothing resolves to them — check
  placement/target/format/schedule) and ads with impressions but zero
  clicks (weak creative or landing page).

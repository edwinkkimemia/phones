# Ad Creative Specs — PhoneLaptops.co.ke

Where ads appear and the exact sizes users see. Create creatives to these dimensions.

## WIDE banners

Shown above the breadcrumb on product + category pages, and between homepage
sections (`below-hero`, `below-deals`, `above-footer`).

| Device  | Displayed size   |
| ------- | ---------------- |
| Desktop | ≈ 1216 × 176 px  |
| Tablet  | ≈ 720 × 144 px   |
| Phone   | ≈ 343 × 112 px   |
| **Design at** | **1920 × 400 px** (JPG, ~200–400 KB) |

## SQUARE ads

Shown in the product-page sidebar below “Still deciding?” (two stacked).

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

- **Shows on** — GLOBAL (everywhere), HOMEPAGE (section), CATEGORY or PRODUCT.
- **Target** — `below-hero` / `below-deals` / `above-footer` for homepage,
  a category slug (e.g. `laptops`) or product slug for the rest, or `all`.
  Suggestions appear as you type; matching ignores case and spaces.
- **Inheritance** — products automatically show their parent category's banners
  (wide above the breadcrumb, square in the sidebar) unless a product-specific
  ad outranks them. Priority order: exact product → category → global.
- **Priority** — lowest number wins when several ads match the same slot.
- Exact matches beat wildcards (`all`), which beat GLOBAL.
- Use **Pause** instead of delete for seasonal creatives you will reuse.

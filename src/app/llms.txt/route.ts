import { PRODUCTS, CATEGORIES } from "@/data/catalog";

// llms.txt — machine-readable store digest for AI assistants & crawlers.
// Convention: https://llmstxt.org
export async function GET() {
  const base = "https://phonelaptops.co.ke";
  const lines: string[] = [
    "# PhoneLaptops.co.ke",
    "",
    "> Your Trusted Technology Store in Kenya. Latest Tech. Honest Prices. Delivered.",
    "> Genuine laptops, desktops, iPhones, smartphones, tablets, wearables, storage, accessories and repair parts.",
    "> Prices in Kenyan Shillings (KES). M-Pesa accepted. Delivery across Kenya. WhatsApp: 0715 135 141.",
    "",
    "## Categories",
    "",
    ...CATEGORIES.map((c) => `- [${c.name}](${base}/${c.slug}): ${c.description}`),
    "",
    "## Featured products",
    "",
    ...[...PRODUCTS]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 30)
      .map(
        (p) =>
          `- [${p.name}](${base}/${p.category}/${p.slug}): KES ${p.price.toLocaleString("en-KE")}${
            p.compareAtPrice ? ` (was KES ${p.compareAtPrice.toLocaleString("en-KE")})` : ""
          }. ${p.condition === "NEW" ? "Brand new" : "Certified pre-owned"}. Rating ${p.rating}/5. ${p.tagline}`
      ),
    "",
    "## Policies",
    "",
    "- Brand-new devices carry a 12-month warranty; certified pre-owned iPhones carry 6 months.",
    "- 7-day dead-on-arrival cover with replacement or refund after verification.",
    "- Payment: M-Pesa STK push, card, or pay on delivery in selected zones.",
    "- Delivery: Nairobi same-day/next-day; Mombasa, Kisumu, Nakuru, Eldoret 1–2 days; other towns 2–3 days.",
    "- Support: WhatsApp 0715 135 141, support@phonelaptops.co.ke, Moi Avenue Nairobi.",
    "",
    "## Sitemap",
    "",
    `- Full sitemap: ${base}/sitemap.xml`,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

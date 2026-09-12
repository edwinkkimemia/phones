import { PRODUCTS } from "@/data/catalog";
import type { ProductT } from "@/types";
import { kes } from "@/lib/utils";

export interface Advice {
  reply: string;
  products: ProductT[];
}

// --- Local recommendation engine (works with zero API keys) ---
// Understands budget ("under 100k"), category, brand, use-case and
// service questions (delivery, warranty, payment, contact).

const CATEGORY_WORDS: [RegExp, string][] = [
  [/laptop|notebook|thinkpad|probook|macbook|pavilion|xps/i, "laptops"],
  [/desktop|tower|elitebook mini|mac mini|all-?in-?one/i, "desktops"],
  [/iphone|ios|apple phone/i, "iphones"],
  [/\bwatch|smartwatch|wearable|band\b/i, "wearables"],
  [/\btablet|ipad|tab\b/i, "tablets"],
  [/ssd|hdd|hard drive|storage|flash|memory card/i, "storage"],
  [/\bbag|backpack|sleeve|case\b/i, "laptop-bags"],
  [/\bram|battery|charger|adapter|screen replacement|spare|repair|fix/i, "laptop-parts"],
  [/phone screen|phone battery|flex/i, "phone-parts"],
  [/phone|smartphone|samsung|tecno|infinix|xiaomi|redmi|pixel/i, "phones"],
  [/gaming|game|ps5|controller|keyboard|mouse|headset/i, "gaming"],
  [/charger|earbuds|headphone|power bank|cable|hub|accessor/i, "accessories"],
];

const BRANDS = ["apple", "samsung", "hp", "lenovo", "dell", "asus", "acer", "xiaomi", "tecno", "infinix", "jbl", "logitech", "anker", "sandisk", "oraimo", "amazfit"];

const USE_CASES: [RegExp, (p: ProductT) => number][] = [
  [/gam/i, (p) => (p.category === "gaming" ? 30 : p.price > 130000 ? 8 : 0)],
  [/student|school|campus|learn|study/i, (p) => (p.price < 65000 ? 20 : 0)],
  [/business|office|work|excel|job/i, (p) => (/probook|thinkpad|elitebook|latitude/i.test(p.name) ? 25 : p.price > 55000 && p.price < 100000 ? 10 : 0)],
  [/photo|camera|video|content|tiktok|youtube/i, (p) => (/iphone|galaxy s|pixel/i.test(p.name) ? 25 : 0)],
  [/battery|long/i, (p) => (/macbook|oraimo|amazfit|power bank/i.test(p.name) ? 15 : 0)],
  [/cheap|budget|affordable|starter/i, (p) => (p.price < 35000 ? 20 : 0)],
];

function parseBudget(q: string): number | null {
  const m =
    q.match(/under\s+(\d[\d,]*)\s*k/i) ??
    q.match(/below\s+(\d[\d,]*)\s*k/i) ??
    q.match(/(\d[\d,]*)\s*k\b/i) ??
    q.match(/kes\s*(\d[\d,]*)/i);
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ""));
  if (/k\s*$/i.test(m[0]) && n < 1000) n *= 1000;
  return n;
}

function serviceAnswer(q: string): string | null {
  if (/deliver|shipping|dispatch|arrive|nairobi|mombasa|kisumu|nakuru|eldoret/i.test(q))
    return "We deliver across Kenya — Nairobi same-day/next-day; Mombasa, Kisumu, Nakuru and Eldoret in 1–2 days; other towns 2–3 days. Fees from KES 250, confirmed at checkout. Track any order from the Track Order page, or ask me here with your order number.";
  if (/warranty|guarantee|return|refund|repair|broken|fault/i.test(q))
    return "Brand-new devices carry a 12-month warranty (pre-owned iPhones 6 months), plus 7-day dead-on-arrival cover. Keep your receipt and WhatsApp us on 0715 135 141 with your order number if anything goes wrong.";
  if (/pay|mpesa|m-pesa|payment|deposit|installment|lipa/i.test(q))
    return "Pay with M-Pesa STK push (fastest — just enter your PIN), card, or pay on delivery in selected zones. You always see the exact total before paying.";
  if (/contact|human|call|location|shop|where|open|hour/i.test(q))
    return "Talk to a human: WhatsApp/call 0715 135 141 (8am–8pm daily), email support@phonelaptops.co.ke, or visit us on Moi Avenue, Nairobi.";
  if (/^(hi|hello|hey|habari|niaje|sasa)\b/i.test(q) && q.trim().length < 20)
    return "Hello! 👋 I'm the PhoneLaptops assistant. Tell me your budget and what you need — e.g. “gaming laptop under 150k”, “iPhone under 60k”, or “best student laptop”.";
  if (/deal|offer|discount|promo|cheap/i.test(q) && q.trim().length < 30)
    return "Today's hottest deals are on the Deals page — and code TECH10 takes 10% off orders over KES 10,000. Tell me your budget and I'll pick the best-value options.";
  return null;
}

export function adviseLocal(message: string): Advice {
  const q = message.trim();
  const service = serviceAnswer(q);
  if (service && !/(laptop|phone|iphone|watch|tablet|desktop|under \d)/i.test(q)) {
    return { reply: service, products: [] };
  }

  const budget = parseBudget(q);
  const cats = CATEGORY_WORDS.filter(([re]) => re.test(q)).map(([, c]) => c);
  const brandHit = BRANDS.find((b) => new RegExp(`\\b${b}\\b`, "i").test(q));

  let pool = cats.length
    ? [...PRODUCTS].filter((p) => cats.includes(p.category) || (cats.includes("phones") && p.category === "iphones"))
    : [...PRODUCTS];
  if (brandHit) {
    const branded = pool.filter((p) => p.brand.toLowerCase() === brandHit);
    if (branded.length > 0) pool = branded;
  }
  if (budget) pool = pool.filter((p) => p.price <= budget);
  if (pool.length === 0) {
    // Nothing in budget — show closest alternatives above budget.
    let alt = cats.length ? [...PRODUCTS].filter((p) => cats.includes(p.category)) : [...PRODUCTS];
    alt.sort((a, b) => a.price - b.price);
    const picks = alt.slice(0, 3);
    return {
      reply: `Nothing matches that budget exactly${budget ? ` (under ${kes(budget)})` : ""} — but these closest picks are worth a look. Or tell me a slightly higher budget and I'll re-search.`,
      products: picks,
    };
  }

  const scored = pool.map((p) => {
    let s = p.rating * 4 + Math.min(10, p.soldCount / 60);
    if (p.isDeal) s += 8;
    if (p.stockStatus === "OUT_OF_STOCK") s -= 50;
    for (const [re, fn] of USE_CASES) if (re.test(q)) s += fn(p);
    if (budget) s += Math.max(0, 10 - (budget - p.price) / (budget / 10)); // prefer close-to-budget value
    return { p, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const picks = scored.slice(0, 3).map((x) => x.p);

  const lead = picks[0];
  const reply = [
    budget
      ? `For ${kes(budget)} and under, my top pick is the **${lead.name}** at ${kes(lead.price)}${lead.compareAtPrice ? ` (save ${kes(lead.compareAtPrice - lead.price)})` : ""}.`
      : `Based on what you asked, my top pick is the **${lead.name}** at ${kes(lead.price)}.`,
    picks.length > 1
      ? `Also compare: ${picks.slice(1).map((p) => `${p.name} (${kes(p.price)})`).join(" vs ")}.`
      : "",
    `All genuine with warranty, M-Pesa checkout and countrywide delivery. Want specs compared, or shall I find something cheaper?`,
  ]
    .filter(Boolean)
    .join(" ");

  return { reply, products: picks };
}

export function toApiProducts(products: ProductT[]) {
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    category: p.category,
    name: p.name,
    brand: p.brand,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    rating: p.rating,
    image: p.images[0]?.url ?? "",
    url: `/product/${p.slug}`,
  }));
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  readMins: number;
  keywords: string[];
  intro: string;
  sections: { h: string; body: string }[];
  relatedSlugs: string[];
  faqs: [string, string][];
}

export const GUIDES: Guide[] = [
  {
    slug: "laptop-buying-guide-kenya",
    title: "How to Choose a Laptop in Kenya (2026 Buying Guide)",
    description:
      "Student, business or gaming? Core i5 vs i7, 8GB vs 16GB RAM, SSD sizes and honest Kenyan price bands — plus which laptops we recommend at every budget.",
    updated: "September 2026",
    readMins: 8,
    keywords: ["laptops in Kenya", "buy laptops Kenya", "cheap laptops Kenya", "laptop prices Kenya"],
    intro:
      "Buying a laptop in Kenya in 2026 comes down to four decisions: processor, RAM, storage and screen — matched to what you actually do every day. Get those right and even a KES 43,000 machine will feel fast for years. This guide gives you honest price bands, spec minimums and the models Kenyans actually buy.",
    sections: [
      {
        h: "1. Pick your use-case first",
        body: `<p><strong>Students & office work:</strong> Core i3/i5 or Ryzen 5, 8GB RAM, 512GB SSD. Anything in the <strong>KES 43,000–60,000</strong> band handles coursework, Zoom, Excel and browsing with ease.</p><p><strong>Business & professionals:</strong> Core i5/i7 or Ryzen 7, <strong>16GB RAM</strong>, 512GB SSD. Budget <strong>KES 59,000–90,000</strong> for a machine that survives 4+ years of daily work — the business sweet spot.</p><p><strong>Creators, developers & gamers:</strong> Core i7/Ryzen 7 or Apple M-series, 16GB+ RAM, dedicated graphics (RTX 4050/4060) for gaming and 3D. Expect <strong>KES 135,000+</strong>.</p>`,
      },
      {
        h: "2. The specs that actually matter",
        body: `<ul><li><strong>RAM:</strong> 8GB is the 2026 minimum; 16GB is the smart buy for multitasking. RAM is the cheapest meaningful upgrade — a KES 3,499 stick can revive a slow laptop.</li><li><strong>Storage:</strong> insist on SSD (NVMe), never a spinning hard drive. 512GB suits most people; 256GB only if you live in the cloud.</li><li><strong>Processor:</strong> ignore the alphabet soup — 12th-gen Intel or newer, Ryzen 5000-series or newer, or any Apple M chip will all feel fast.</li><li><strong>Display:</strong> Full-HD (1920×1080) minimum. Matte screens handle Kenyan sunlight far better than glossy ones.</li><li><strong>Battery:</strong> 8+ hours real use for campus and field work; carry a 20000mAh power bank for long days.</li></ul>`,
      },
      {
        h: "3. Our picks at every budget",
        body: `<ul><li><strong>Under KES 50,000:</strong> the Acer Aspire Lite (Core i3, 8GB, 512GB) — the honest budget champion.</li><li><strong>KES 55,000–75,000:</strong> the HP Pavilion 15 (Core i5) for students, or the HP ProBook 440 G10 (Core i7, 16GB) — Kenya's favourite business laptop.</li><li><strong>KES 75,000–90,000:</strong> the Lenovo ThinkPad E14 Gen 5 (Ryzen 7) — legendary durability for rougher commutes.</li><li><strong>KES 130,000+:</strong> ASUS TUF Gaming A15 (RTX 4050) for gamers, MacBook Air M3 for creators who live on battery.</li></ul><p>Every model above is stocked <a href="/laptops">in our laptop shop</a> with genuine warranty and M-Pesa checkout.</p>`,
      },
      {
        h: "4. Buy genuine, pay smart",
        body: `<p>Counterfeit and refurbished-as-new machines are common in Nairobi's grey market. Buy sealed stock with verifiable serials and a written warranty — every product page on PhoneLaptops.co.ke states the condition badge (<strong>Brand New</strong> vs <strong>Pre-Owned</strong>) upfront. Pay with M-Pesa STK push for instant confirmation, and keep your receipt for warranty claims.</p>`,
      },
    ],
    relatedSlugs: ["hp-probook-440-g10", "hp-pavilion-15-eg3000", "acer-aspire-lite-i3", "lenovo-thinkpad-e14-gen5"],
    faqs: [
      ["How much is a good laptop in Kenya?", "A good student laptop costs KES 43,000–60,000, a solid business laptop KES 59,000–90,000, and gaming/creator machines start around KES 135,000 in 2026."],
      ["Is 8GB RAM enough for a laptop?", "Yes for students and office work. Choose 16GB if you multitask heavily, edit video, code, or want the laptop to stay fast for 4+ years."],
      ["SSD or HDD — which should I buy?", "Always SSD. An SSD makes even a budget laptop feel fast; a spinning hard drive will feel slow on day one."],
      ["Do laptops in Kenya come with warranty?", "Genuine retailers include at least 12 months. Every PhoneLaptops.co.ke product page states the exact warranty — keep your receipt."],
    ],
  },
  {
    slug: "iphone-buying-guide-kenya",
    title: "Buying an iPhone in Kenya: New vs Pre-Owned (2026 Guide)",
    description:
      "Sealed vs certified pre-owned, which storage size, battery health red flags and honest iPhone prices in Kenya — everything to check before you pay.",
    updated: "September 2026",
    readMins: 6,
    keywords: ["iPhones Kenya", "iPhone prices Kenya", "pre-owned iPhone Kenya"],
    intro:
      "iPhones hold their value in Kenya better than any other phone — which also makes them the most faked, refurbished-as-new and overpriced devices in the market. Here's how to buy with confidence: when brand-new is worth it, when certified pre-owned saves you KES 50,000+, and the checks that matter.",
    sections: [
      {
        h: "1. Brand new vs certified pre-owned",
        body: `<p><strong>Buy brand new (sealed)</strong> if you want the latest chip and camera, full Apple warranty and maximum resale value — e.g. the iPhone 17 Pro or iPhone 15. <strong>Buy certified pre-owned</strong> if you want 90% of the experience for far less: a Grade-A iPhone 13 with 89%+ battery health at KES 54,999 does everything most people need.</p><p>The golden rule: the condition must be stated <em>before</em> you pay. On PhoneLaptops.co.ke every iPhone carries an unambiguous <strong>Brand New</strong> or <strong>Pre-Owned</strong> badge — <a href="/iphones">browse the iPhone store</a>.</p>`,
      },
      {
        h: "2. Storage, colour and battery health",
        body: `<ul><li><strong>Storage:</strong> 128GB is enough for most people (photos back up to iCloud/Google Photos). Choose 256GB if you shoot lots of video or keep phones 3+ years.</li><li><strong>Battery health:</strong> for pre-owned, demand 89%+ with the figure stated in writing — plus at least a 6-month shop warranty. Below 85%, budget for a replacement (around KES 4,999).</li><li><strong>Colour</strong> affects resale slightly; condition and storage affect it far more.</li></ul>`,
      },
      {
        h: "3. Checks before you pay",
        body: `<ul><li>Verify the serial on Apple's coverage checker and confirm it matches the box.</li><li>Confirm Face ID, all cameras, speakers, microphones and charging work.</li><li>Check Settings → Battery → Battery Health, and confirm no "Unknown Part" warnings.</li><li>Pay with M-Pesa for a transaction record, and keep the receipt — it's your warranty document.</li></ul>`,
      },
    ],
    relatedSlugs: ["iphone-17-pro-256gb", "iphone-15-128gb", "iphone-13-128gb-preowned"],
    faqs: [
      ["Should I buy a new or pre-owned iPhone in Kenya?", "Buy new for the latest models and full warranty; buy certified pre-owned (89%+ battery, 6-month warranty) to save 30–50% on previous generations."],
      ["What battery health is good for a used iPhone?", "89% or higher. Below 85% you should budget around KES 4,999 for a replacement battery."],
      ["How do I know an iPhone is genuine?", "Verify the serial on Apple's website, check for 'Unknown Part' warnings, test Face ID and cameras, and buy sealed or graded stock with a written warranty."],
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

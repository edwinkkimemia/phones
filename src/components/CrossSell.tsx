import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/utils";

export interface CrossSellT {
  eyebrow: string;
  heading: string;
  blurb: string;
  badges: [string, string, string];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  waText: string;
}

// Category-specific cross-sell panel shown below the product grid.
// Same layout everywhere, but every category carries its own message.
export const CROSS_SELL: Record<string, CrossSellT> = {
  laptops: {
    eyebrow: "Complete Your Setup",
    heading: "Laptop Essentials",
    blurb: "Padded bags, original chargers and SSD upgrades picked to match the laptops above — genuine stock, honest prices.",
    badges: ["✓ Padded Bags", "✓ Original Chargers", "✓ SSD Upgrades"],
    primary: { label: "Shop accessories", href: "/accessories" },
    secondary: { label: "Laptop bags", href: "/laptop-bags" },
    waText: "Hello PhoneLaptops! Which accessories fit my laptop?",
  },
  desktops: {
    eyebrow: "Finish Your Desk",
    heading: "Desktop Add-Ons That Matter",
    blurb: "Keyboards, mice, storage and UPS backup to complete your office or studio setup in one delivery.",
    badges: ["✓ Keyboards & Mice", "✓ Extra Storage", "✓ One Delivery"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Help me complete my desktop setup.",
  },
  phones: {
    eyebrow: "Power Up Your Phone",
    heading: "Chargers, Audio & Covers",
    blurb: "Fast GaN chargers, booming audio and tough covers for the phones above — original brands only.",
    badges: ["✓ Fast Charging", "✓ Original Audio", "✓ Tough Covers"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which accessories fit my phone?",
  },
  iphones: {
    eyebrow: "Protect Your iPhone",
    heading: "Cases, MagSafe & 20W Charging",
    blurb: "Slim cases, MagSafe wallets and certified 20W chargers — everything an iPhone needs, nothing it doesn't.",
    badges: ["✓ Cases & Covers", "✓ MagSafe Ready", "✓ Certified 20W"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which accessories fit my iPhone?",
  },
  tablets: {
    eyebrow: "Tablet Essentials",
    heading: "Keyboards, Covers & Pencils",
    blurb: "Turn your tablet into a classroom or office machine — keyboard covers, tough cases and precision styluses.",
    badges: ["✓ Keyboard Covers", "✓ Kid-Safe Cases", "✓ Styluses"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which accessories fit my tablet?",
  },
  wearables: {
    eyebrow: "Make It Yours",
    heading: "Straps, Chargers & Audio",
    blurb: "Spare straps for every outfit, dedicated chargers and buds that pair perfectly with your watch.",
    badges: ["✓ Spare Straps", "✓ Watch Chargers", "✓ Pairing Buds"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which straps fit my smartwatch?",
  },
  storage: {
    eyebrow: "Never Lose a File",
    heading: "Backup & Carry More",
    blurb: "Rugged externals for full-machine backup and pocket flash drives for the daily carry — up to 5-year warranties.",
    badges: ["✓ External Drives", "✓ Flash Drives", "✓ 5-Yr Warranty"],
    primary: { label: "Shop all storage", href: "/storage" },
    secondary: { label: "Laptop upgrades", href: "/laptop-parts" },
    waText: "Hello PhoneLaptops! Which storage fits my needs?",
  },
  accessories: {
    eyebrow: "Bundle & Save",
    heading: "Today's Accessory Deals",
    blurb: "Chargers, audio, cables and more at deal prices — bundle two or more and save on delivery too.",
    badges: ["✓ Deal Prices", "✓ Original Brands", "✓ Bundle Savings"],
    primary: { label: "Shop today's deals", href: "/deals" },
    waText: "Hello PhoneLaptops! Any bundle deals on accessories?",
  },
  "laptop-parts": {
    eyebrow: "Repair, Don't Replace",
    heading: "Genuine Laptop Spares",
    blurb: "Original-spec RAM, batteries, chargers and screens — send your model on WhatsApp and we confirm fit free before you pay.",
    badges: ["✓ Original Spec", "✓ Free Fit Check", "✓ 6-Month Warranty"],
    primary: { label: "Shop phone parts", href: "/phone-parts" },
    waText: "Hello PhoneLaptops! Will this part fit my laptop?",
  },
  "phone-parts": {
    eyebrow: "Repair, Don't Replace",
    heading: "Original Phone Parts",
    blurb: "Original AMOLED screens, zero-cycle batteries and pro toolkits — with free fitting advice and Nairobi fitting on request. Fix it for a fraction of a new phone.",
    badges: ["✓ Original Quality", "✓ 100% Battery Health", "✓ Fitting Available"],
    primary: { label: "Shop laptop parts", href: "/laptop-parts" },
    waText: "Hello PhoneLaptops! I need free fitting advice for a phone part.",
  },
  "laptop-bags": {
    eyebrow: "Carry Everything",
    heading: "Sleeves, Mice & Chargers",
    blurb: "Slim sleeves for short trips, wireless mice for the desk and compact GaN chargers for the road.",
    badges: ["✓ Slim Sleeves", "✓ Wireless Mice", "✓ Travel Chargers"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which bag fits my laptop?",
  },
  gaming: {
    eyebrow: "Level Up Your Setup",
    heading: "Keyboards, Mice & Audio",
    blurb: "Hot-swap mechanical keyboards, high-DPI mice and immersive headsets to match your rig.",
    badges: ["✓ Mechanical Keys", "✓ High-DPI Mice", "✓ Pro Headsets"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Recommend gaming peripherals under my budget.",
  },
  deals: {
    eyebrow: "Stack the Savings",
    heading: "Bundle Deals With Accessories",
    blurb: "Pair today's deals with chargers, covers and audio — one checkout, one delivery, maximum value.",
    badges: ["✓ Real Discounts", "✓ Bundle Savings", "✓ One Delivery"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Any bundle deals today?",
  },
  "new-arrivals": {
    eyebrow: "Just Landed",
    heading: "Gear Up for the New",
    blurb: "The newest devices deserve proper protection — cases, chargers and covers already in stock.",
    badges: ["✓ Day-One Covers", "✓ Fast Chargers", "✓ Sealed Stock"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! Which accessories fit the new arrivals?",
  },
  "best-sellers": {
    eyebrow: "Crowd Favourites",
    heading: "What Buyers Add Next",
    blurb: "The chargers, covers and audio Kenya buys alongside its favourite devices.",
    badges: ["✓ Tried & Tested", "✓ Original Brands", "✓ Honest Prices"],
    primary: { label: "Shop accessories", href: "/accessories" },
    waText: "Hello PhoneLaptops! What should I add to my order?",
  },
};

export const DEFAULT_CROSS_SELL: CrossSellT = {
  eyebrow: "Complete Your Setup",
  heading: "Don't Forget the Essentials",
  blurb: "Chargers, covers, audio and storage from original brands — genuine stock with warranty.",
  badges: ["✓ Original Brands", "✓ Honest Prices", "✓ Warranty Included"],
  primary: { label: "Shop accessories", href: "/accessories" },
  waText: "Hello PhoneLaptops! What should I add to my order?",
};

export default function CrossSell({ content }: { content: CrossSellT }) {
  return (
    <section className="container-x pb-10 md:pb-14">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 260px at 12% 20%, rgba(0,230,118,.16), transparent), radial-gradient(500px 240px at 88% 30%, rgba(43,107,255,.35), transparent)",
          }}
        />
        <div className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Sparkles className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{content.eyebrow}</p>
            <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{content.heading}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{content.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              {content.badges.map((b) => (
                <span key={b} className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5">{b}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-2 md:justify-items-end">
            <Link href={content.primary.href} className="btn-primary w-full !bg-accent !text-ink-950 hover:!bg-white md:w-auto">
              {content.primary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            {content.secondary && (
              <Link href={content.secondary.href} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">
                {content.secondary.label}
              </Link>
            )}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(content.waText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp w-full md:w-auto"
            >
              <WhatsAppIcon className="h-4 w-4" /> Ask an expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

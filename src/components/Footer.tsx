import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { WhatsAppIcon, TikTokIcon } from "@/components/icons";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com/phonelaptopske", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com/phonelaptopske", Icon: Instagram },
  { label: "X (Twitter)", href: "https://x.com/phonelaptopske", Icon: Twitter },
  { label: "YouTube", href: "https://youtube.com/@phonelaptopske", Icon: Youtube },
  { label: "TikTok", href: "https://tiktok.com/@phonelaptopske", Icon: TikTokIcon },
];

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Laptops", href: "/laptops" },
      { label: "Desktops", href: "/desktops" },
      { label: "Phones", href: "/phones" },
      { label: "iPhones", href: "/iphones" },
      { label: "Tablets", href: "/tablets" },
      { label: "Wearables", href: "/wearables" },
      { label: "Storage", href: "/storage" },
      { label: "Laptop Bags", href: "/laptop-bags" },
      { label: "Laptop Parts", href: "/laptop-parts" },
      { label: "Phone Parts", href: "/phone-parts" },
      { label: "Accessories", href: "/accessories" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Delivery Information", href: "/delivery" },
      { label: "Warranty", href: "/warranty" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Buying Guides", href: "/guides" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

export default function Footer({ settings, categories = [] }: { settings?: Record<string, string>; categories?: { slug: string; name: string }[] }) {
  const phone = settings?.phone_display ?? "+254 715 135 141";
  const waDisplay = settings?.whatsapp_display ?? "0715 135 141";
  const waNumber = settings?.whatsapp_number ?? "254715135141";
  const email = settings?.email ?? "support@phonelaptops.co.ke";
  const address = settings?.address ?? "Moi Avenue, Nairobi, Kenya";
  const tagline = settings?.tagline ?? "Latest Gadgets. Better Living.";
  const shopSlugs = new Set(COLS[0].links.map((l) => l.href));
  const extraLinks = categories
    .filter((c) => !shopSlugs.has(`/${c.slug}`))
    .map((c) => ({ label: c.name, href: `/${c.slug}` }));
  return (
    <footer className="bg-ink-950 text-slate-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/fav.jpg"
              alt="PhoneLaptops"
              width={96}
              height={96}
              className="h-11 w-11 rounded-xl"
            />
            <span>
              <span className="block font-display text-lg font-extrabold text-white">
                PhoneLaptops<span className="text-accent">.co.ke</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {tagline}
              </span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Latest laptops, phones, iPhones and accessories in Kenya. Latest
            tech. Honest prices. Delivered.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> {phone}</p>
            <p className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4 text-accent" /> WhatsApp: {waDisplay}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> {email}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {address}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-500">@phonelaptopske everywhere</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-300 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              {c.title === "Shop" && extraLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-300 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} PhoneLaptops.co.ke — Your Trusted Technology Store.</p>
          <p className="flex items-center gap-2">
            <span className="rounded-md bg-mpesa px-2 py-1 font-bold text-white">M-PESA</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-bold text-white">VISA</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-bold text-white">Pay on Delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { faqJsonLd } from "@/lib/seo";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-10 md:py-14">
      <div className="card space-y-4 p-6 text-[15px] leading-relaxed text-slate-600 md:p-8">{children}</div>
    </div>
  );
}

function Crumb({ current }: { current: string }) {
  return (
    <nav className="container-x flex items-center gap-1.5 pt-5 text-xs text-slate-500" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-brand-700">Home</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="truncate font-semibold text-slate-800">{current}</span>
    </nav>
  );
}

export function DeliveryPage() {
  const zones = [
    ["Nairobi CBD & environs", "Same-day / Next-day"],
    ["Westlands / Kilimani / Karen", "Same-day"],
    ["Thika", "Next-day"],
    ["Mombasa", "1–2 days"],
    ["Kisumu", "1–2 days"],
    ["Nakuru", "1–2 days"],
    ["Eldoret", "1–2 days"],
    ["Other towns (courier)", "2–3 days"],
  ];
  return (
    <>
      <PageHero
        eyebrow="Delivery information"
        heading="We Deliver Across Kenya"
        blurb="Same-day dispatch in Nairobi and 1–3 days countrywide — every parcel packed securely, insured in transit and confirmed by phone."
        badges={["✓ Same-Day Nairobi", "✓ 1–3 Days Countrywide", "✓ Insured Parcels"]}
        image="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="Delivery" />
      <Shell>
        <p className="flex items-center gap-2 font-bold text-slate-900"><Truck className="h-5 w-5 text-brand-600" /> Fast, tracked, reliable</p>
        <p>Order before 3pm for same-day dispatch in Nairobi. All parcels are packed securely, insured in transit and confirmed by phone before dispatch.</p>
        <table className="w-full overflow-hidden rounded-xl text-sm">
          <thead><tr className="bg-slate-100 text-left"><th className="p-3">Zone</th><th className="p-3">Typical ETA</th></tr></thead>
          <tbody>{zones.map(([z, e]) => <tr key={z} className="border-t border-slate-100"><td className="p-3 font-semibold">{z}</td><td className="p-3">{e}</td></tr>)}</tbody>
        </table>
        <p className="text-sm text-slate-500">Exact delivery fees are configured per zone and always shown at checkout before you pay. Pay with M-Pesa or on delivery where available.</p>
        <Link href="/track-order" className="btn-primary w-fit">Track My Order</Link>
      </Shell>
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        heading="Talk to a Real Human"
        blurb="Call, WhatsApp or drop a message below — real specialists reply in minutes, 8am–8pm daily."
        badges={["✓ Real Humans", "✓ 8am–8pm Daily", "✓ Minutes on WhatsApp"]}
        image="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="Contact" />
      <Shell>
        <div className="grid gap-3 sm:grid-cols-3">
          <a href="tel:+254715135141" className="card p-4 text-center"><Phone className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">+254 715 135 141</p><p className="text-xs text-slate-500">8am–8pm daily</p></a>
          <a href="https://wa.me/254715135141" target="_blank" rel="noreferrer" className="card p-4 text-center"><WhatsAppIcon className="mx-auto h-5 w-5 text-[#25D366]" /><p className="mt-2 text-sm font-bold">WhatsApp Us</p><p className="text-xs text-slate-500">0715 135 141 • Fastest</p></a>
          <a href="mailto:support@phonelaptops.co.ke" className="card p-4 text-center"><Mail className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">Email</p><p className="text-xs text-slate-500">Replies within hours</p></a>
        </div>
        <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Moi Avenue, Nairobi, Kenya — pickup available after phone confirmation.</p>
        <ContactForm />
      </Shell>
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About PhoneLaptops"
        heading="Your Trusted Technology Store"
        blurb="Genuine tech, honest Kenyan prices and delivery across the country — no grey imports, no games."
        badges={["✓ Genuine Stock", "✓ Honest Prices", "✓ Kenya-Wide Delivery"]}
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="About" />
      <Shell>
        <p><strong className="text-slate-900">PhoneLaptops.co.ke</strong> exists for one reason: to make buying genuine tech in Kenya simple, fairly priced and stress-free.</p>
        <p>We stock the latest laptops, iPhones, smartphones, tablets and accessories — every unit sourced from trusted suppliers, clearly graded (Brand New vs Pre-Owned), covered by warranty and delivered across Kenya.</p>
        <p><strong className="text-slate-900">Latest Tech. Honest Prices. Delivered.</strong> That is the promise on every order: authentic products, M-Pesa convenience, WhatsApp support from people who know devices, and after-sales help if anything goes wrong.</p>
      </Shell>
    </>
  );
}

export function WarrantyPage() {
  return (
    <>
      <PageHero
        eyebrow="Peace of mind"
        heading="Warranty, Returns & Support"
        blurb="Clear written warranty on every product plus 7-day dead-on-arrival cover — enforced by real humans, not fine print."
        badges={["✓ 12-Month New", "✓ 7-Day DOA Cover", "✓ 6-Month Pre-Owned"]}
        image="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="Warranty" />
      <Shell>
        <p className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Clear warranty on every product</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Brand-new devices: 12-month warranty unless stated otherwise on the product page.</li>
          <li>Certified pre-owned iPhones: 6-month shop warranty, battery health 89%+.</li>
          <li>Accessories: 6–18 months as listed per product.</li>
        </ul>
        <p className="flex items-center gap-2 font-bold text-slate-900"><RotateCcw className="h-5 w-5 text-brand-600" /> 7-day DOA cover</p>
        <p>Dead on arrival? Contact us within 7 days with photos/video and we will replace or refund after verification. Items must be returned with all accessories and packaging.</p>
        <p className="text-sm text-slate-500">To claim: WhatsApp 0715 135 141 with your order number, product and a description of the issue. Keep your receipt.</p>
      </Shell>
    </>
  );
}

export function FaqPage() {
  const faqs: [string, string][] = [
    ["Are your products genuine?", "Yes. We sell sealed brand-new stock and clearly-graded pre-owned devices. Serials are verifiable and every order includes a receipt."],
    ["How do I pay?", "M-Pesa STK push (fastest), card, or pay on delivery in selected zones. You never pay before seeing your exact total at checkout."],
    ["How fast is delivery?", "Nairobi same-day/next-day; Mombasa, Kisumu, Nakuru, Eldoret typically 1–2 days; other towns 2–3 days via courier."],
    ["What's the difference between Brand New and Pre-Owned?", "Brand New means sealed with manufacturer warranty. Pre-Owned means tested, graded, battery health disclosed, with a 6-month shop warranty. The condition badge on every product page and card makes it unambiguous."],
    ["Can I get help choosing?", "Absolutely — WhatsApp 0715 135 141 with your budget and use-case and a specialist will recommend 2–3 options, no pressure."],
    ["What if my item develops a problem?", "Contact us within the warranty period with your order number. We diagnose, repair, replace or refund per the warranty terms."],
  ];
  return (
    <>
      <PageHero
        eyebrow="FAQs"
        heading="Frequently Asked Questions"
        blurb="Straight answers on genuineness, payment, delivery and warranty — still stuck? Our humans reply in minutes on WhatsApp."
        badges={["✓ Quick Answers", "✓ Real Policies", "✓ Human Support"]}
        image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="FAQs" />
      <Shell>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
        {faqs.map(([q, a]) => (
          <div key={q}>
            <p className="font-bold text-slate-900">{q}</p>
            <p className="mt-1">{a}</p>
          </div>
        ))}
      </Shell>
    </>
  );
}

const LEGAL_HERO: Record<"privacy" | "terms" | "returns", { heading: string; blurb: string; badges: string[]; image: string }> = {
  privacy: {
    heading: "Privacy Policy",
    blurb: "What data we collect, why we need it and the choices you have — in plain language, no legalese.",
    badges: ["✓ No Data Selling", "✓ Encrypted Payments", "✓ Consent-Based Alerts"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  },
  terms: {
    heading: "Terms & Conditions",
    blurb: "The fair rules behind every order: pricing, confirmation, delivery timelines and warranty.",
    badges: ["✓ Clear Pricing", "✓ Written Warranty", "✓ Fair Policies"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80",
  },
  returns: {
    heading: "Returns Policy",
    blurb: "Changed your mind or received a fault? Simple documented steps to a replacement or refund.",
    badges: ["✓ 7-Day DOA Cover", "✓ Verified Claims", "✓ M-Pesa Refunds"],
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1600&q=80",
  },
};

export function LegalPage({ kind }: { kind: "privacy" | "terms" | "returns" }) {
  const hero = LEGAL_HERO[kind];
  const crumb = kind === "privacy" ? "Privacy" : kind === "terms" ? "Terms" : "Returns";
  return (
    <>
      <PageHero eyebrow="Legal" heading={hero.heading} blurb={hero.blurb} badges={hero.badges} image={hero.image} />
      <Crumb current={crumb} />
      <Shell>
        <p>PhoneLaptops.co.ke (“we”) processes your name, phone, email and delivery address solely to fulfil orders, provide support and (with consent) send deal alerts. We never sell personal data. M-Pesa and card payments are processed over encrypted connections; we do not store PINs or card numbers.</p>
        <p>Prices are in Kenyan Shillings and may change without notice; the price at checkout is final. Orders are confirmed on payment (or on phone confirmation for pay-on-delivery). Delivery ETAs are estimates. Warranty and 7-day DOA cover apply as listed on each product page.</p>
        <p>Questions: support@phonelaptops.co.ke / +254 715 135 141.</p>
      </Shell>
    </>
  );
}

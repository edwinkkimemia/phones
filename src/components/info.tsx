import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { faqJsonLd } from "@/lib/seo";
import RepairCTA from "@/components/RepairCTA";
import ContactForm from "@/components/ContactForm";

function Shell({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-10 md:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{kicker}</p>
      <h1 className="section-title mt-1">{title}</h1>
      <div className="card mt-6 space-y-4 p-6 text-[15px] leading-relaxed text-slate-600 md:p-8">{children}</div>
    </div>
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
    <Shell title="We Deliver Across Kenya" kicker="Delivery information">
      <p className="flex items-center gap-2 font-bold text-slate-900"><Truck className="h-5 w-5 text-brand-600" /> Fast, tracked, reliable</p>
      <p>Order before 3pm for same-day dispatch in Nairobi. All parcels are packed securely, insured in transit and confirmed by phone before dispatch.</p>
      <table className="w-full overflow-hidden rounded-xl text-sm">
        <thead><tr className="bg-slate-100 text-left"><th className="p-3">Zone</th><th className="p-3">Typical ETA</th></tr></thead>
        <tbody>{zones.map(([z, e]) => <tr key={z} className="border-t border-slate-100"><td className="p-3 font-semibold">{z}</td><td className="p-3">{e}</td></tr>)}</tbody>
      </table>
      <p className="text-sm text-slate-500">Exact delivery fees are configured per zone and always shown at checkout before you pay. Pay with M-Pesa or on delivery where available.</p>
      <Link href="/track-order" className="btn-primary w-fit">Track My Order</Link>
    </Shell>
    <RepairCTA />
    </>
  );
}

export function ContactPage() {
  return (
    <>
    <Shell title="Talk to a Real Human" kicker="Contact us">
      <div className="grid gap-3 sm:grid-cols-3">
        <a href="tel:+254715135141" className="card p-4 text-center"><Phone className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">+254 715 135 141</p><p className="text-xs text-slate-500">8am–8pm daily</p></a>
        <a href="https://wa.me/254715135141" target="_blank" rel="noreferrer" className="card p-4 text-center"><WhatsAppIcon className="mx-auto h-5 w-5 text-[#25D366]" /><p className="mt-2 text-sm font-bold">WhatsApp Us</p><p className="text-xs text-slate-500">0715 135 141 • Fastest</p></a>
        <a href="mailto:support@phonelaptops.co.ke" className="card p-4 text-center"><Mail className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">Email</p><p className="text-xs text-slate-500">Replies within hours</p></a>
      </div>
      <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Moi Avenue, Nairobi, Kenya — pickup available after phone confirmation.</p>
      <ContactForm />
    </Shell>
    <RepairCTA />
    </>
  );
}

export function AboutPage() {
  return (
    <>
    <Shell title="Your Trusted Technology Store" kicker="About PhoneLaptops">
      <p><strong className="text-slate-900">PhoneLaptops.co.ke</strong> exists for one reason: to make buying genuine tech in Kenya simple, fairly priced and stress-free.</p>
      <p>We stock the latest laptops, iPhones, smartphones, tablets and accessories — every unit sourced from trusted suppliers, clearly graded (Brand New vs Pre-Owned), covered by warranty and delivered across Kenya.</p>
      <p><strong className="text-slate-900">Latest Tech. Honest Prices. Delivered.</strong> That is the promise on every order: authentic products, M-Pesa convenience, WhatsApp support from people who know devices, and after-sales help if anything goes wrong.</p>
    </Shell>
    <RepairCTA />
    </>
  );
}

export function WarrantyPage() {
  return (
    <>
    <Shell title="Warranty, Returns & Support" kicker="Peace of mind">
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
    <RepairCTA />
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
    <Shell title="Frequently Asked Questions" kicker="FAQs">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      {faqs.map(([q, a]) => (
        <div key={q}>
          <p className="font-bold text-slate-900">{q}</p>
          <p className="mt-1">{a}</p>
        </div>
      ))}
    </Shell>
    <RepairCTA />
    </>
  );
}

export function LegalPage({ kind }: { kind: "privacy" | "terms" | "returns" }) {
  const titles = { privacy: "Privacy Policy", terms: "Terms & Conditions", returns: "Returns Policy" };
  return (
    <Shell title={titles[kind]} kicker="Legal">
      <p>PhoneLaptops.co.ke (“we”) processes your name, phone, email and delivery address solely to fulfil orders, provide support and (with consent) send deal alerts. We never sell personal data. M-Pesa and card payments are processed over encrypted connections; we do not store PINs or card numbers.</p>
      <p>Prices are in Kenyan Shillings and may change without notice; the price at checkout is final. Orders are confirmed on payment (or on phone confirmation for pay-on-delivery). Delivery ETAs are estimates. Warranty and 7-day DOA cover apply as listed on each product page.</p>
      <p>Questions: support@phonelaptops.co.ke / +254 715 135 141.</p>
    </Shell>
  );
}

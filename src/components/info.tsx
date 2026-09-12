import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, RotateCcw, Phone, Mail, MapPin, ChevronRight, BadgeCheck, Tag, FileCheck, Undo2, BookOpen, Newspaper } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { faqJsonLd } from "@/lib/seo";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { PRODUCTS } from "@/data/catalog";
import { getPublishedPosts } from "@/lib/blog";
import { getPublishedGuides } from "@/lib/guides";
import { WHATSAPP_NUMBER, kes } from "@/lib/utils";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="card space-y-4 p-6 text-[15px] leading-relaxed text-slate-600 md:p-8">{children}</div>
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

function PageGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x grid gap-8 py-10 md:py-14 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">{children}</div>
      <InfoSidebar />
    </div>
  );
}

async function InfoSidebar() {
  const trending = [...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
  const [posts, guides] = await Promise.all([
    getPublishedPosts().then((p) => p.slice(0, 4)).catch(() => []),
    getPublishedGuides().then((g) => g.slice(0, 4)).catch(() => []),
  ]);
  return (
    <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
      <div className="card p-4">
        <p className="font-extrabold">Trending products</p>
        <div className="mt-3 space-y-2.5">
          {trending.map((r) => (
            <Link key={r.id} href={`/product/${r.slug}`} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 p-2 transition hover:border-brand-300 hover:shadow-card">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                {r.images[0] && <Image src={r.images[0].url} alt={r.name} fill sizes="56px" className="object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-800">{r.name}</span>
                <span className="text-xs font-extrabold text-brand-700">{kes(r.price)}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/deals" className="mt-3 block rounded-xl bg-ink-950 py-2.5 text-center text-xs font-bold text-white hover:bg-ink-800">
          Shop all deals →
        </Link>
      </div>

      {posts.length > 0 && (
        <div className="card p-4">
          <p className="flex items-center gap-1.5 font-extrabold"><Newspaper className="h-4 w-4 text-brand-600" /> Latest articles</p>
          <div className="mt-2 divide-y divide-slate-100">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="block py-2.5 text-sm font-bold leading-snug text-slate-700 hover:text-brand-700">
                {p.title}
              </Link>
            ))}
          </div>
          <Link href="/blog" className="mt-1 block text-xs font-bold text-brand-700 hover:underline">All articles →</Link>
        </div>
      )}

      {guides.length > 0 && (
        <div className="card p-4">
          <p className="flex items-center gap-1.5 font-extrabold"><BookOpen className="h-4 w-4 text-brand-600" /> Buying guides</p>
          <div className="mt-2 divide-y divide-slate-100">
            {guides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="block py-2.5 text-sm font-bold leading-snug text-slate-700 hover:text-brand-700">
                {g.title}
              </Link>
            ))}
          </div>
          <Link href="/guides" className="mt-1 block text-xs font-bold text-brand-700 hover:underline">All guides →</Link>
        </div>
      )}

      <div className="card bg-emerald-600 !border-emerald-600 p-4 text-white">
        <p className="font-extrabold">Need help? Ask an expert</p>
        <p className="mt-1 text-xs text-emerald-50">Real specialists reply in minutes, 8am–8pm daily.</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello PhoneLaptops! I have a question.")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block rounded-xl bg-white py-2.5 text-center text-xs font-extrabold text-emerald-700"
        >
          Chat on WhatsApp
        </a>
      </div>
    </aside>
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
      <PageGrid>
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
      </PageGrid>
    </>
  );
}

export function ContactPage() {
  const steps: [string, string][] = [
    ["1", "Send your message below — it opens in WhatsApp, addressed and ready to send."],
    ["2", "A specialist replies in minutes (8am–8pm daily) — often with photos, prices and options."],
    ["3", "We resolve it: order help, a product link, a fitting check or a warranty claim started."],
  ];
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
      <PageGrid>
        <Shell>
          <div className="grid gap-3 sm:grid-cols-3">
            <a href="tel:+254715135141" className="card p-4 text-center"><Phone className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">+254 715 135 141</p><p className="text-xs text-slate-500">8am–8pm daily</p></a>
            <a href="https://wa.me/254715135141" target="_blank" rel="noreferrer" className="card p-4 text-center"><WhatsAppIcon className="mx-auto h-5 w-5 text-[#25D366]" /><p className="mt-2 text-sm font-bold">WhatsApp Us</p><p className="text-xs text-slate-500">0715 135 141 • Fastest</p></a>
            <a href="mailto:support@phonelaptops.co.ke" className="card p-4 text-center"><Mail className="mx-auto h-5 w-5 text-brand-600" /><p className="mt-2 text-sm font-bold">Email</p><p className="text-xs text-slate-500">Replies within hours</p></a>
          </div>
          <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Moi Avenue, Nairobi, Kenya — pickup available after phone confirmation.</p>
          <ContactForm />
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-900">What happens next?</p>
            <ol className="mt-2 space-y-1.5 text-sm">
              {steps.map(([n, t]) => (
                <li key={n} className="flex gap-2.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-950 text-[11px] font-extrabold text-white">{n}</span>{t}</li>
              ))}
            </ol>
          </div>
          <p className="text-sm">Checking an order? <Link href="/track-order" className="font-bold text-brand-700 hover:underline">Track it live →</Link> <span className="text-slate-400">•</span> Quick answers: <Link href="/faqs" className="font-bold text-brand-700 hover:underline">FAQs →</Link> <span className="text-slate-400">•</span> Cover question: <Link href="/warranty" className="font-bold text-brand-700 hover:underline">Warranty →</Link></p>
        </Shell>
      </PageGrid>
    </>
  );
}

export function AboutPage() {
  const stats: [string, string][] = [
    ["12,400+", "Verified buyer reviews"],
    ["4.9 / 5", "Average store rating"],
    ["12-month", "Warranty on new devices"],
    ["7-day", "Dead-on-arrival cover"],
  ];
  const values = [
    { Icon: BadgeCheck, t: "Sealed & verifiable", d: "Brand-new stock arrives sealed with checkable serials. What we list is exactly what arrives." },
    { Icon: ShieldCheck, t: "Graded honestly", d: "Pre-owned devices are tested, graded and labelled — battery health disclosed before you pay, never after." },
    { Icon: Tag, t: "Honest Kenyan prices", d: "We price-check against the local market daily. No inflated 'was' prices, no haggling theatre." },
    { Icon: Truck, t: "Delivery that shows up", d: "Same-day dispatch in Nairobi, tracked couriers upcountry, and a phone call before any parcel moves." },
    { Icon: Phone, t: "Humans who know devices", d: "WhatsApp, call or email — you talk to specialists who sell and support this tech every day." },
    { Icon: RotateCcw, t: "After-sales that answers", d: "Warranty claims and returns handled in the open, with receipts, timelines and follow-through." },
  ];
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
      <PageGrid>
        <div className="min-w-0 space-y-6">
          <Shell>
            <p><strong className="text-slate-900">PhoneLaptops.co.ke</strong> exists for one reason: to make buying genuine tech in Kenya simple, fairly priced and stress-free.</p>
            <p>We stock the latest laptops, iPhones, smartphones, tablets and accessories — every unit sourced from trusted suppliers, clearly graded (Brand New vs Pre-Owned), covered by warranty and delivered across Kenya.</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {stats.map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="font-display text-xl font-extrabold text-slate-900">{v}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </Shell>

          <div>
            <h2 className="section-title">How we earn your trust</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {values.map(({ Icon, t, d }) => (
                <div key={t} className="card p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-bold text-slate-900">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-ink-950 !border-ink-950 p-6 text-white md:p-8">
            <p className="font-display text-xl font-extrabold">Latest Tech. Honest Prices. Delivered.</p>
            <p className="mt-1 text-sm text-slate-300">That is the promise on every order. Come see it in action:</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/deals" className="btn-primary !bg-accent !text-ink-950 hover:!bg-white">Shop today&apos;s deals</Link>
              <Link href="/guides" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">Read buying guides</Link>
              <Link href="/contact" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">Talk to us</Link>
            </div>
          </div>
        </div>
      </PageGrid>
    </>
  );
}

export function WarrantyPage() {
  const cover: [string, string][] = [
    ["Brand-new devices", "12 months — full cover, parts and labour."],
    ["Certified pre-owned iPhones", "6 months — battery health 89%+ stated in writing."],
    ["Accessories", "6–18 months as listed on the product page."],
    ["Parts & upgrades", "6 months — fit confirmed free before you pay."],
  ];
  const steps: [string, string][] = [
    ["Message us", "WhatsApp 0715 135 141 with your order number, the product and what is wrong — photos or a short video speed things up."],
    ["We verify", "We confirm your order and cover, and diagnose remotely where possible (settings checks, battery reports, serial lookup)."],
    ["We resolve", "Repair, replacement or refund per the terms below — most claims concluded within a week of verification."],
  ];
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
      <PageGrid>
        <Shell>
          <p className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="h-5 w-5 text-emerald-600" /> What is covered</p>
          <div className="overflow-hidden rounded-xl border border-slate-100 text-sm">
            {cover.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-t border-slate-100 p-3 first:border-0 sm:grid-cols-[220px_1fr]">
                <p className="font-bold text-slate-900">{k}</p>
                <p>{v}</p>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 font-bold text-slate-900"><RotateCcw className="h-5 w-5 text-brand-600" /> 7-day dead-on-arrival cover</p>
          <p>Arrived faulty? Contact us within 7 days of delivery with photos or video and we replace or refund after verification. Items must come back complete — device, accessories and packaging.</p>
          <p className="font-bold text-slate-900">How to claim — three steps</p>
          <ol className="space-y-2.5">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-950 text-xs font-extrabold text-white">{i + 1}</span>
                <span><strong className="text-slate-900">{t}.</strong> {d}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">Not covered: physical or liquid damage, unauthorised repairs or modifications, normal battery wear beyond the stated health, and lost accessories. Keep your receipt — it is your warranty document.</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/254715135141?text=${encodeURIComponent("Hello PhoneLaptops! I'd like to start a warranty claim. My order number is: ")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon className="mx-auto h-4 w-4" /> Start a claim
            </a>
            <Link href="/returns" className="btn-ghost">Returns policy →</Link>
          </div>
        </Shell>
      </PageGrid>
    </>
  );
}

export function ReturnsPage() {
  const steps: [string, string][] = [
    ["Tell us fast", "WhatsApp 0715 135 141 within 7 days of delivery with your order number and clear photos or video of the issue."],
    ["We verify", "We confirm the fault against the DOA and warranty terms — usually the same day."],
    ["Send it back", "Nairobi: drop-off or rider pickup. Upcountry: courier the item complete with accessories and packaging."],
    ["Get sorted", "Replacement ships first where stock allows — otherwise an M-Pesa refund within 3 business days of inspection."],
  ];
  return (
    <>
      <PageHero
        eyebrow="No-drama returns"
        heading="Returns Policy"
        blurb="Changed your mind or received a fault? Simple documented steps to a replacement or refund — no interrogation."
        badges={["✓ 7-Day DOA Cover", "✓ Verified Claims", "✓ M-Pesa Refunds"]}
        image="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1600&q=80"
      />
      <Crumb current="Returns" />
      <PageGrid>
        <Shell>
          <p className="flex items-center gap-2 font-bold text-slate-900"><Undo2 className="h-5 w-5 text-brand-600" /> Faulty on arrival (7 days)</p>
          <p>Dead, damaged or materially not as described? We replace or refund in full after verification — return courier on us within Nairobi for confirmed faults.</p>
          <p className="flex items-center gap-2 font-bold text-slate-900"><FileCheck className="h-5 w-5 text-brand-600" /> Change of mind (7 days)</p>
          <p>Sealed, unused items in original packaging qualify for replacement or refund within 7 days with your receipt. Opened accessories and fitted parts are handled case-by-case — ask us first and we will be straight with you. Delivery fees are refundable only where the error was ours.</p>
          <p className="font-bold text-slate-900">The process</p>
          <ol className="space-y-2.5">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-950 text-xs font-extrabold text-white">{i + 1}</span>
                <span><strong className="text-slate-900">{t}.</strong> {d}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">Everything must come back complete — device, chargers, manuals and box. Refunds go to the M-Pesa number on the order unless you ask otherwise.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/contact" className="btn-primary w-fit">Contact us</Link>
            <Link href="/warranty" className="btn-ghost">Warranty terms →</Link>
          </div>
        </Shell>
      </PageGrid>
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
      <PageGrid>
        <Shell>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
          {faqs.map(([q, a]) => (
            <div key={q}>
              <p className="font-bold text-slate-900">{q}</p>
              <p className="mt-1">{a}</p>
            </div>
          ))}
        </Shell>
      </PageGrid>
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

function PolicySection({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-bold text-slate-900">{h}</h2>
      <div className="mt-1 space-y-2 text-slate-600">{children}</div>
    </section>
  );
}

const PRIVACY_SECTIONS: { h: string; body: string[] }[] = [
  { h: "1. Data we collect", body: ["Contact details you give us: name, phone number, email address and delivery address.", "Order details: what you bought, what you paid and how (M-Pesa, card or pay on delivery).", "Support messages: WhatsApp chats, emails and call notes so we can follow through.", "Technical basics: device type and pages visited, used only to keep the site fast and working."] },
  { h: "2. How we use it", body: ["To fulfil and deliver your order — including courier booking and delivery confirmation calls.", "To support you: warranty claims, returns, repairs and product advice.", "To send deal alerts, but only where you opted in (newsletter, popup or WhatsApp list).", "To prevent fraud and abuse of checkout, promos and reviews."] },
  { h: "3. Payments", body: ["M-Pesa and card payments run over encrypted connections through licensed processors.", "We never see or store your M-Pesa PIN or card numbers — only the payment confirmation tied to your order."] },
  { h: "4. Cookies & analytics", body: ["We use strictly-necessary storage (cart, wishlist, preferences) plus basic traffic measurement to improve the shop.", "No advertising trackers, no cross-site profiling, no data brokering — ever."] },
  { h: "5. Who we share with", body: ["Delivery couriers (name, phone, town) so your parcel reaches you.", "Payment processors (transaction references) so your payment confirms.", "Nobody else. We do not sell, rent or trade personal data, full stop."] },
  { h: "6. How long we keep it", body: ["Order and receipt records are kept for warranty and tax purposes, then minimised.", "Deal-alert subscriptions last until you opt out — every message includes an opt-out path."] },
  { h: "7. Your rights", body: ["Ask what we hold about you, correct it, or request deletion where the law allows.", "Opt out of marketing any time: reply STOP on WhatsApp or email support@phonelaptops.co.ke.", "We respond to privacy requests within 7 days."] },
];

const TERMS_SECTIONS: { h: string; body: string[] }[] = [
  { h: "1. Who we are", body: ["PhoneLaptops.co.ke is a Kenyan technology retailer operating from Moi Avenue, Nairobi. By placing an order you agree to these terms alongside the warranty and returns policies linked on every product page."] },
  { h: "2. Products & condition", body: ["Every listing carries a condition badge: Brand New (sealed, manufacturer warranty) or Pre-Owned/Refurbished (tested, graded, battery health disclosed).", "Photos, specs and prices are checked for accuracy, but the condition badge and written description prevail where they differ."] },
  { h: "3. Pricing & orders", body: ["All prices are in Kenyan Shillings. The price confirmed at checkout is final — even if a catalogue price changes afterwards.", "An order is confirmed on successful payment, or on phone confirmation for pay-on-delivery. We may cancel and refund any order we cannot fulfil (pricing error, dead stock)."] },
  { h: "4. Payment", body: ["M-Pesa STK push (fastest), debit/credit card, or pay on delivery in selected zones.", "Pay-on-delivery orders are confirmed by phone first; repeated missed confirmations may lead to cancellation."] },
  { h: "5. Delivery", body: ["Nairobi same-day/next-day; major towns 1–2 days; other towns 2–3 days via courier. ETAs are honest estimates, not guarantees.", "Risk passes to you on delivery. Inspect sealed items before the rider leaves where possible and report damage within 48 hours."] },
  { h: "6. Warranty & returns", body: ["Brand-new devices carry a 12-month warranty; certified pre-owned iPhones 6 months; accessories 6–18 months as listed; parts 6 months.", "Dead-on-arrival items are replaced or refunded within 7 days of delivery after verification.", "Full detail lives on the Warranty and Returns pages — those terms form part of this agreement."] },
  { h: "7. Fair use", body: ["Fraudulent orders, payment reversals after delivery, review manipulation and promo abuse lead to blacklisting and legal action where applicable."] },
  { h: "8. Liability", body: ["Our liability is limited to the value of the affected order. We are not liable for indirect losses (lost data, downtime) — back up your devices before service or repair."] },
  { h: "9. Changes & contact", body: ["We may update these terms; the version at checkout governs your order. Questions: support@phonelaptops.co.ke / +254 715 135 141."] },
];

export function LegalPage({ kind }: { kind: "privacy" | "terms" | "returns" }) {
  const hero = LEGAL_HERO[kind];
  const crumb = kind === "privacy" ? "Privacy" : kind === "terms" ? "Terms" : "Returns";
  const sections = kind === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const updated = "September 2026";
  return (
    <>
      <PageHero eyebrow="Legal" heading={hero.heading} blurb={hero.blurb} badges={hero.badges} image={hero.image} />
      <Crumb current={crumb} />
      <PageGrid>
        <Shell>
          <p className="text-sm text-slate-400">Last updated: {updated}. Questions about this page? <Link href="/contact" className="font-bold text-brand-700 hover:underline">Contact us →</Link></p>
          {sections.map((s) => (
            <PolicySection key={s.h} h={s.h}>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </PolicySection>
          ))}
        </Shell>
      </PageGrid>
    </>
  );
}

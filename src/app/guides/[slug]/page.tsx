import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getProduct } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import PageHero from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/icons";
import { faqJsonLd } from "@/lib/seo";
import { WHATSAPP_NUMBER, kes } from "@/lib/utils";
import { getPublishedGuide, getPublishedGuides } from "@/lib/guides";

export async function generateStaticParams() {
  const guides = await getPublishedGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = await getPublishedGuide(params.slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: `https://phonelaptops.co.ke/guides/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.description,
      type: "article",
      ...(g.cover ? { images: [{ url: g.cover, alt: g.title }] } : {}),
    },
  };
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const g = await getPublishedGuide(params.slug);
  if (!g) notFound();
  const related = g.relatedSlugs.map(getProduct).filter(Boolean);
  const all = await getPublishedGuides();
  const moreGuides = all.filter((x) => x.slug !== g.slug).slice(0, 4);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    ...(g.cover ? { image: g.cover } : {}),
    dateModified: g.updated,
    author: { "@type": "Organization", name: "PhoneLaptops.co.ke", url: "https://phonelaptops.co.ke" },
    publisher: {
      "@type": "Organization",
      name: "PhoneLaptops.co.ke",
      logo: { "@type": "ImageObject", url: "https://phonelaptops.co.ke/logo.png" },
    },
    mainEntityOfPage: `https://phonelaptops.co.ke/guides/${g.slug}`,
  };

  return (
    <>
    <PageHero
      eyebrow="Buying guide • Kenya"
      heading={g.title}
      blurb={g.description}
      badges={[`${g.readMins} min read`, `Updated ${g.updated}`, "By PhoneLaptops experts"]}
      image={g.cover ?? undefined}
    />
    <nav className="container-x flex items-center gap-1.5 pt-5 text-xs text-slate-500" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-brand-700">Home</Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/guides" className="hover:text-brand-700">Guides</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="truncate font-semibold text-slate-800">{g.title}</span>
    </nav>
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(g.faqs)) }} />
      <AdSlot placement="GUIDES" target={g.slug} bare />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">

          <p className="richtext mt-5 !text-base">{g.intro}</p>

          {g.sections.map((s) => (
            <section key={s.h} className="mt-8">
              <h2 className="font-display text-xl font-extrabold tracking-tight">{s.h}</h2>
              <div className="richtext mt-3" dangerouslySetInnerHTML={{ __html: s.body }} />
            </section>
          ))}

          <ShareButtons name={g.title} url={`https://phonelaptops.co.ke/guides/${g.slug}`} />

          <h2 className="font-display mt-10 text-xl font-extrabold">Recommended in this guide</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>

          <h2 className="font-display mt-10 text-xl font-extrabold">Common questions</h2>
          <div className="card mt-4 divide-y divide-slate-100">
            {g.faqs.map(([q, a]) => (
              <div key={q} className="p-4">
                <p className="text-sm font-bold">{q}</p>
                <p className="mt-1 text-sm text-slate-600">{a}</p>
              </div>
            ))}
          </div>

          <div className="card mt-8 bg-ink-950 !border-ink-950 p-6 text-center text-white">
            <p className="font-display text-xl font-extrabold">Still not sure? Talk to an expert free.</p>
            <p className="mt-1 text-sm text-slate-300">Tell us your budget and what you'll use it for — we'll recommend 2–3 options, no pressure.</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello PhoneLaptops! I read your guide (${g.title}) and need help choosing.`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp mx-auto mt-4 w-fit"
            >
              <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>

          <div className="mt-6 text-center">
            <Link href="/guides" className="text-sm font-bold text-brand-700 hover:underline">← All guides</Link>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="card p-4">
            <p className="font-extrabold">In this guide</p>
            <div className="mt-3 space-y-2.5">
              {related.map((r) => r && (
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

          <div>
            <p className="label">Sponsored</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <AdSlot placement="GUIDES" target={g.slug} format="SQUARE" />
              <AdSlot placement="GUIDES" target={g.slug} format="SQUARE" index={1} />
            </div>
          </div>

          <div className="card bg-emerald-600 !border-emerald-600 p-4 text-white">
            <p className="font-extrabold">Deal alerts on WhatsApp</p>
            <p className="mt-1 text-xs text-emerald-50">Price drops land here first. Join 20,000+ smart shoppers.</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! Add me to PhoneLaptops deal alerts.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-xl bg-white py-2.5 text-center text-xs font-extrabold text-emerald-700"
            >
              Join free
            </a>
          </div>

          <div className="card p-4">
            <p className="font-extrabold">More guides</p>
            <div className="mt-2 divide-y divide-slate-100">
              {moreGuides.map((m) => (
                <Link key={m.slug} href={`/guides/${m.slug}`} className="block py-2.5 text-sm font-bold text-slate-700 hover:text-brand-700">
                  {m.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}

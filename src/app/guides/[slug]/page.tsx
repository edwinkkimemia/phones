import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, MessageCircle } from "lucide-react";
import { GUIDES, getGuide } from "@/data/guides";
import { getProduct } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { faqJsonLd } from "@/lib/seo";
import { WHATSAPP_NUMBER } from "@/lib/utils";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: `https://phonelaptops.co.ke/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article" },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const related = g.relatedSlugs.map(getProduct).filter(Boolean);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
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
    <article className="container-x max-w-3xl py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(g.faqs)) }} />
      <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/guides" className="hover:text-brand-700">Guides</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{g.title}</span>
      </nav>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Buying guide • Kenya</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{g.title}</h1>
      <p className="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {g.readMins} min read</span>
        <span>Updated {g.updated}</span>
        <span>By PhoneLaptops experts</span>
      </p>
      <p className="richtext mt-5 !text-base">{g.intro}</p>

      {g.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="font-display text-xl font-extrabold tracking-tight">{s.h}</h2>
          <div className="richtext mt-3" dangerouslySetInnerHTML={{ __html: s.body }} />
        </section>
      ))}

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
          <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
        </a>
      </div>
    </article>
  );
}

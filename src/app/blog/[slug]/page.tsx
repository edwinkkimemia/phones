import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, Eye, MessageCircle } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { WHATSAPP_NUMBER, kes } from "@/lib/utils";
import { getPublishedPost } from "@/lib/blog";
import { PRODUCTS } from "@/data/catalog";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPublishedPost(params.slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.excerpt,
    alternates: { canonical: `https://phonelaptops.co.ke/blog/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.excerpt,
      type: "article",
      ...(p.cover ? { images: [{ url: p.cover, alt: p.title }] } : {}),
    },
  };
}

function relatedProducts(tags: string[], slug: string) {
  const words = tags.join(" ").toLowerCase();
  const scored = PRODUCTS.map((p) => {
    let s = 0;
    const hay = `${p.brand} ${p.category} ${p.name}`.toLowerCase();
    for (const t of tags) {
      const w = t.toLowerCase();
      if (p.brand.toLowerCase() === w) s += 3;
      else if (p.category.replace("-", " ") === w || p.category === w) s += 3;
      else if (hay.includes(w)) s += 1;
    }
    s += p.rating + Math.min(5, p.soldCount / 200);
    if (words.includes("deal") && p.isDeal) s += 2;
    return { p, s };
  });
  return scored
    .filter((x) => x.p.slug !== slug)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const p = await getPublishedPost(params.slug);
  if (!p) notFound();
  const related = relatedProducts(p.tags, p.slug);

  const words = p.body.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    ...(p.cover ? { image: p.cover } : {}),
    datePublished: p.createdAt,
    dateModified: p.updatedAt,
    author: { "@type": "Organization", name: "PhoneLaptops.co.ke", url: "https://phonelaptops.co.ke" },
    publisher: {
      "@type": "Organization",
      name: "PhoneLaptops.co.ke",
      logo: { "@type": "ImageObject", url: "https://phonelaptops.co.ke/logo.png" },
    },
    mainEntityOfPage: `https://phonelaptops.co.ke/blog/${p.slug}`,
  };

  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-brand-700">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{p.title}</span>
      </nav>
      <AdSlot placement="BLOG" target={p.slug} bare />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{p.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {mins} min read</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {p.views.toLocaleString()} reads</span>
            <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
          </p>

          {p.cover && (
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl">
              <Image src={p.cover} alt={p.title} fill sizes="800px" className="object-cover" priority />
            </div>
          )}

          <div className="richtext mt-6 !text-[16px]" dangerouslySetInnerHTML={{ __html: p.body }} />

          <ShareButtons name={p.title} />

          <div className="card mt-8 bg-ink-950 !border-ink-950 p-6 text-center text-white md:p-8">
            <p className="font-display text-xl font-extrabold">Ready to buy what you just read about?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-300">
              Genuine stock, honest Kenyan prices, M-Pesa checkout and delivery across Kenya — plus code TECH10 for 10% off your first order.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/deals" className="btn-primary !bg-accent !text-ink-950 hover:!bg-white">Shop today's deals</Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello! I read your article ("${p.title}") and have a question.`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
              >
                <MessageCircle className="h-4 w-4" /> Ask an expert
              </a>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/blog" className="text-sm font-bold text-brand-700 hover:underline">← All articles</Link>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="card p-4">
            <p className="font-extrabold">Trending products</p>
            <div className="mt-3 space-y-2.5">
              {related.map((r) => (
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
              <AdSlot placement="BLOG" target={p.slug} format="SQUARE" />
              <AdSlot placement="BLOG" target={p.slug} format="SQUARE" index={1} />
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
        </aside>
      </div>
    </div>
  );
}

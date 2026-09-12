import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, Eye, MessageCircle } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { WHATSAPP_NUMBER } from "@/lib/utils";

interface FullPost {
  slug: string; title: string; excerpt: string; cover?: string | null;
  body: string; tags: string[]; views: number; createdAt: string; updatedAt: string;
  seoTitle?: string | null; seoDescription?: string | null;
}

async function getPost(slug: string): Promise<FullPost | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phonelaptops.co.ke";
  try {
    const res = await fetch(`${base}/api/blog?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.post ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPost(params.slug);
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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const p = await getPost(params.slug);
  if (!p) notFound();

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
    <article className="container-x max-w-3xl py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-brand-700">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{p.title}</span>
      </nav>

      <div className="mt-5 flex flex-wrap gap-1.5">
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
            href={`${WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/254715135141"}?text=${encodeURIComponent(`Hello! I read your article ("${p.title}") and have a question.`)}`}
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
  );
}

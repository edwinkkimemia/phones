import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Newspaper, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Tech Blog Kenya — Deals, Guides & Buying Advice",
  description:
    "Hard-marketing-free-zone? No — honest, aggressive tech advice for Kenya: laptop deals, iPhone prices, repair-vs-replace guides and buying playbooks.",
  alternates: { canonical: "https://phonelaptops.co.ke/blog" },
};

interface Post {
  id: string; slug: string; title: string; excerpt: string;
  cover?: string | null; tags: string[]; createdAt: string;
}

async function getPosts(): Promise<Post[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phonelaptops.co.ke";
  try {
    const res = await fetch(`${base}/api/blog`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const [first, ...rest] = posts;
  return (
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Blog</p>
      <h1 className="section-title mt-1">Tech Advice That Saves You Money</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Buying playbooks, deal alerts and repair guides — written by the team that sells and supports this tech daily.
      </p>

      {posts.length === 0 && (
        <div className="card mt-8 p-10 text-center text-sm text-slate-500">
          Fresh articles dropping soon. Meanwhile, <Link href="/guides" className="font-bold text-brand-700">read our buying guides →</Link>
        </div>
      )}

      {first && (
        <Link href={`/blog/${first.slug}`} className="card group mt-8 grid overflow-hidden transition hover:shadow-pop md:grid-cols-2">
          <div className="relative min-h-[220px] md:min-h-[300px]">
            {first.cover && <Image src={first.cover} alt={first.title} fill sizes="600px" className="object-cover transition duration-500 group-hover:scale-105" />}
          </div>
          <div className="p-6 md:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
              <Newspaper className="h-3.5 w-3.5" /> Featured
            </p>
            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight group-hover:text-brand-700">{first.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{first.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
              Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              {p.cover && <Image src={p.cover} alt={p.title} fill sizes="400px" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
              <h2 className="mt-2 line-clamp-2 font-bold leading-snug group-hover:text-brand-700">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{p.excerpt}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" /> {new Date(p.createdAt).toLocaleDateString()} • PhoneLaptops
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { getPublishedGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Tech Buying Guides Kenya — Laptops, iPhones & More",
  description:
    "Honest Kenyan buying guides: how to choose a laptop, new vs pre-owned iPhones, honest price bands, warranty and M-Pesa tips.",
  alternates: { canonical: "https://phonelaptops.co.ke/guides" },
};

export default async function GuidesPage() {
  const guides = await getPublishedGuides();
  return (
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Learn</p>
      <h1 className="section-title mt-1">Buying Guides for Kenya</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        No jargon, no sponsored rankings — just honest advice from people who sell (and support) these devices every day.
      </p>
      <AdSlot placement="GUIDES" target="guides" bare className="mt-4" />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
            {g.cover && (
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <Image src={g.cover} alt={g.title} fill sizes="600px" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              </div>
            )}
            <div className="p-6">
              <h2 className="font-display text-xl font-extrabold tracking-tight group-hover:text-brand-700">{g.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{g.description}</p>
              <p className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {g.readMins} min read</span>
                <span>Updated {g.updated}</span>
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Read guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

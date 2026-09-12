"use client";
import Link from "next/link";
import Image from "next/image";
import { GitCompareArrows, X } from "lucide-react";
import { PRODUCTS } from "@/data/catalog";
import { useCompare } from "@/lib/store";
import { Price } from "@/components/ui";
import { kes } from "@/lib/utils";

const ROWS = ["Price", "Processor", "RAM", "Storage", "Display", "Battery", "Graphics", "Warranty"];

function specOf(id: string, key: string): string {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return "—";
  if (key === "Price") return kes(p.price);
  const hit = p.specs.find((s) => s.key.toLowerCase().includes(key.toLowerCase()));
  return hit?.value ?? "—";
}

export default function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <GitCompareArrows className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="section-title mt-4">Compare Laptops & Phones</h1>
        <p className="mt-2 text-sm text-slate-500">Tap the compare icon on any product to add up to 4 here.</p>
        <Link href="/deals" className="btn-primary mt-6">Browse deals</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Compare ({items.length}/4)</h1>
        <button onClick={clear} className="btn-ghost !py-2 text-xs">Clear all</button>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="w-32 p-4 text-left text-xs uppercase text-slate-400">Feature</th>
              {items.map((p) => p && (
                <th key={p.id} className="p-4 text-left align-top">
                  <button onClick={() => toggle(p.id)} className="float-right rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove"><X className="h-4 w-4" /></button>
                  <Link href={`/${p.category}/${p.slug}`} className="relative mb-2.5 block aspect-square w-full max-w-[150px] overflow-hidden rounded-2xl bg-slate-50">
                    <Image src={p.images[0]?.url ?? ""} alt={p.name} fill sizes="150px" className="object-cover" />
                  </Link>
                  <p className="text-[11px] font-bold uppercase text-brand-600">{p.brand}</p>
                  <Link href={`/${p.category}/${p.slug}`} className="line-clamp-2 font-bold hover:text-brand-700">{p.name}</Link>
                  <Price price={p.price} compareAt={p.compareAtPrice} size="sm" className="mt-1" />
                  <Link href={`/${p.category}/${p.slug}`} className="mt-2 inline-block rounded-lg bg-ink-950 px-3 py-1.5 text-[11px] font-bold text-white">Buy Now</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r} className={i % 2 === 0 ? "bg-slate-50/60" : ""}>
                <td className="p-4 font-bold text-slate-500">{r}</td>
                {items.map((p) => p && <td key={p.id} className="p-4">{specOf(p.id, r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

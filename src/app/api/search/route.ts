import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/catalog";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").toLowerCase().trim();
  if (!q) return NextResponse.json({ products: [], categories: [], brands: [] });
  const words = q.split(/\s+/);
  const products = PRODUCTS.filter((p) => {
    const hay = `${p.brand} ${p.name} ${p.tagline}`.toLowerCase();
    return words.every((w) => hay.includes(w) || (w.length >= 4 && hay.includes(w.slice(0, 4))));
  }).slice(0, 12);
  const brands = [...new Set(products.map((p) => p.brand))];
  const categories = [...new Set(products.map((p) => p.categoryLabel))];
  return NextResponse.json({ products, brands, categories });
}

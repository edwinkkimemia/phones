"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/catalog";
import { useWishlist } from "@/lib/store";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const items = PRODUCTS.filter((p) => ids.includes(p.id));
  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <Heart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="section-title mt-4">Your Wishlist</h1>
        <p className="mt-2 text-sm text-slate-500">Tap the heart on any product to save it here.</p>
        <Link href="/deals" className="btn-primary mt-6">Discover deals</Link>
      </div>
    );
  }
  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="section-title">Your Wishlist ({items.length})</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

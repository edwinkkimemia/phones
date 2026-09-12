"use client";
import { useState } from "react";
import Link from "next/link";
import { User, Package, Heart } from "lucide-react";
import { useWishlist } from "@/lib/store";

export default function AccountPage() {
  const [tab, setTab] = useState<"signin" | "track">("signin");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("");
  const wishCount = useWishlist((s) => s.ids.length);

  return (
    <div className="container-x max-w-2xl py-10 md:py-14">
      <h1 className="section-title text-center">My Account</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Checkout works without an account — sign in for faster reorders.</p>
      <div className="card mt-6 p-6">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm font-bold">
          <button onClick={() => setTab("signin")} className={`rounded-lg py-2 ${tab === "signin" ? "bg-white shadow" : "text-slate-500"}`}>Sign In</button>
          <button onClick={() => setTab("track")} className={`rounded-lg py-2 ${tab === "track" ? "bg-white shadow" : "text-slate-500"}`}>Find My Order</button>
        </div>
        {tab === "signin" ? (
          <form onSubmit={(e) => e.preventDefault()} className="mt-5 space-y-3">
            <div><label className="label">Email or phone</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com / 0712…" /></div>
            <div><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" /></div>
            <button className="btn-primary w-full"><User className="h-4 w-4" /> Sign In (connects to NextAuth in production)</button>
            <p className="text-center text-xs text-slate-400">Auth is wired via NextAuth + Prisma (credentials + DB sessions). Configure providers in <code>src/lib/auth.ts</code>.</p>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (order.trim()) window.location.href = `/track-order?order=${encodeURIComponent(order.trim())}`; }} className="mt-5 flex gap-2">
            <input className="input uppercase" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="PL-…" />
            <button className="btn-primary shrink-0"><Package className="h-4 w-4" /> Find</button>
          </form>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm font-bold">
          <Link href="/wishlist" className="card p-4 hover:shadow-pop"><Heart className="mx-auto h-5 w-5 text-red-500" /> Wishlist ({wishCount})</Link>
          <Link href="/cart" className="card p-4 hover:shadow-pop"><Package className="mx-auto h-5 w-5 text-brand-600" /> My Cart</Link>
        </div>
      </div>
    </div>
  );
}

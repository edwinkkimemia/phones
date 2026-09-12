"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Package, Heart, MapPin, ShieldCheck, LogOut, Loader2,
  User as UserIcon, KeyRound, ChevronRight,
} from "lucide-react";
import { useWishlist } from "@/lib/store";
import { kes } from "@/lib/utils";

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  paymentMethod: string; total: number; town?: string | null; createdAt: string;
  items: { name: string; qty: number }[];
}

function Security() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setOk(false);
    if (form.newPassword !== form.confirm) {
      setMsg("New passwords don't match.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setOk(true);
    setMsg("Password updated.");
    setForm({ currentPassword: "", newPassword: "", confirm: "" });
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <p className="flex items-center gap-2 font-extrabold"><KeyRound className="h-4 w-4 text-brand-600" /> Security</p>
      <div className="grid gap-2.5 sm:grid-cols-3">
        <input className="input !py-2.5 text-sm" type="password" placeholder="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required autoComplete="current-password" />
        <input className="input !py-2.5 text-sm" type="password" placeholder="New (min 8)" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={8} autoComplete="new-password" />
        <input className="input !py-2.5 text-sm" type="password" placeholder="Confirm new" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={busy} className="btn-ghost !py-2 text-xs disabled:opacity-60">{busy ? "Saving…" : "Change password"}</button>
        {msg && <p className={`text-xs font-bold ${ok ? "text-emerald-700" : "text-red-600"}`}>{msg}</p>}
      </div>
    </form>
  );
}

export default function AccountDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const wishCount = useWishlist((s) => s.ids.length);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/account/login?callbackUrl=/account");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders?mine=1&limit=20")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => setOrders([]));
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="container-x grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const email = session?.user?.email ?? "";
  const initial = (email || "?").charAt(0).toUpperCase();

  return (
    <div className="container-x max-w-3xl py-8 md:py-12">
      <div className="card flex items-center gap-4 bg-ink-950 !border-ink-950 p-5 text-white md:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent font-display text-2xl font-extrabold">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-extrabold">My Account</h1>
          <p className="truncate text-sm text-slate-300">{email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
        <div className="card p-4">
          <Package className="mx-auto h-5 w-5 text-brand-600" />
          <p className="font-display mt-1 text-lg font-extrabold">{orders === null ? "…" : orders.length}</p>
          <p className="text-[11px] text-slate-500">Orders</p>
        </div>
        <Link href="/wishlist" className="card p-4 transition hover:shadow-pop">
          <Heart className="mx-auto h-5 w-5 text-red-500" />
          <p className="font-display mt-1 text-lg font-extrabold">{wishCount}</p>
          <p className="text-[11px] text-slate-500">Wishlist</p>
        </Link>
        <Link href="/track-order" className="card p-4 transition hover:shadow-pop">
          <MapPin className="mx-auto h-5 w-5 text-emerald-600" />
          <p className="font-display mt-1 text-lg font-extrabold">Track</p>
          <p className="text-[11px] text-slate-500">My order</p>
        </Link>
      </div>

      <h2 className="mt-6 font-extrabold">Recent orders</h2>
      <div className="mt-3 space-y-2.5">
        {(orders ?? []).map((o) => (
          <Link
            key={o.id}
            href={`/track-order?order=${encodeURIComponent(o.orderNumber)}`}
            className="card flex flex-wrap items-center gap-2 p-4 transition hover:shadow-pop"
          >
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{o.orderNumber}</p>
              <p className="truncate text-xs text-slate-500">
                {new Date(o.createdAt).toLocaleDateString()} • {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </p>
            </div>
            <span className="chip">{o.status}</span>
            <strong className="text-sm">{kes(o.total)}</strong>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
        {orders !== null && orders.length === 0 && (
          <div className="card p-6 text-center text-sm text-slate-500">
            No orders yet — <Link href="/deals" className="font-bold text-brand-700">grab today's deals →</Link>
          </div>
        )}
        {orders === null && <div className="card p-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-300" /></div>}
      </div>

      <div className="mt-4 grid gap-4">
        <Security />
        <div className="card flex items-start gap-2.5 p-5 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-slate-600">
            <strong className="text-slate-900">Buyer protection:</strong> genuine products, written warranty on every
            order, M-Pesa records for every payment, and support on WhatsApp 0715 135 141.
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <UserIcon className="h-3.5 w-3.5" /> Signed in as {email} • <Link href="/deals" className="font-bold text-brand-700">Continue shopping</Link>
        </p>
      </div>
    </div>
  );
}

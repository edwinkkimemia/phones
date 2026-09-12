"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { UserPlus, Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      // Auto sign-in, then to the dashboard.
      const login = await signIn("credentials", {
        email: form.email || form.phone,
        password: form.password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/account/login");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x grid max-w-md py-10 md:py-14">
      <div className="card space-y-4 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Image src="/fav.jpg" alt="PhoneLaptops" width={64} height={64} className="h-11 w-11 rounded-xl" />
          <div>
            <h1 className="font-display text-xl font-extrabold">Create account</h1>
            <p className="text-xs text-slate-500">Faster checkout, order tracking, deal alerts</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Brian Otieno" required autoComplete="name" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="label">Phone (M-Pesa)</label>
              <input className="input" value={form.phone} onChange={set("phone")} placeholder="0715…" inputMode="tel" autoComplete="tel" />
            </div>
          </div>
          <div>
            <label className="label">Password (min 8 characters) *</label>
            <PasswordInput value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={8} autoComplete="new-password" />
          </div>
          {err && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{err}</p>}
          <button disabled={busy} className="btn-primary w-full !py-3 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy ? "Creating…" : "Create My Account"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Have an account? <Link href="/account/login" className="font-bold text-brand-700 hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-[11px] text-slate-400">By registering you agree to our Terms & Privacy Policy.</p>
      </div>
    </div>
  );
}

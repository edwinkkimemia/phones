"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Lock, Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setErr("Wrong email or password. Try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Image src="/fav.jpg" alt="PhoneLaptops" width={64} height={64} className="h-11 w-11 rounded-xl" />
          <div>
            <p className="font-display text-lg font-extrabold">Admin Login</p>
            <p className="text-xs text-slate-500">PhoneLaptops.co.ke console</p>
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@phonelaptops.co.ke" required autoComplete="username" />
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
        </div>
        {err && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{err}</p>}
        <button disabled={busy} className="btn-primary w-full !py-3 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {busy ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Authorized staff only. Contact the store owner if you need access.
        </p>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

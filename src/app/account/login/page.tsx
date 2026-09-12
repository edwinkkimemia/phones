"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/account";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await signIn("credentials", { email: login, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setErr("Wrong email/phone or password. Try again or create an account.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="container-x grid max-w-md py-10 md:py-14">
      <div className="card space-y-4 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Image src="/fav.jpg" alt="PhoneLaptops" width={64} height={64} className="h-11 w-11 rounded-xl" />
          <div>
            <h1 className="font-display text-xl font-extrabold">Welcome back</h1>
            <p className="text-xs text-slate-500">Sign in to track orders & check out faster</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Email or phone</label>
            <input className="input" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="you@example.com / 0715…" required autoComplete="username" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          {err && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{err}</p>}
          <button disabled={busy} className="btn-primary w-full !py-3 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          New here? <Link href="/account/register" className="font-bold text-brand-700 hover:underline">Create an account</Link>
        </p>
        <p className="text-center text-xs text-slate-400">No account needed to shop — but members check out in seconds.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

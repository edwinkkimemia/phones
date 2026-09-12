import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x grid max-w-md place-items-center py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <SearchX className="h-8 w-8" />
      </span>
      <h1 className="font-display mt-5 text-4xl font-extrabold">404</h1>
      <p className="mt-2 text-sm text-slate-500">
        This page wandered off. The deal you're hunting is probably on one of these:
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-primary !py-2.5 text-sm">Home</Link>
        <Link href="/deals" className="btn-ghost !py-2.5 text-sm">Today's deals</Link>
        <Link href="/laptops" className="btn-ghost !py-2.5 text-sm">Laptops</Link>
      </div>
    </div>
  );
}

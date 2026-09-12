"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import GuideForm from "../form";

export default function NewGuidePage() {
  const router = useRouter();
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/guides" className="hover:text-brand-700">Guides</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">New guide</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">New Guide</h1>
      <GuideForm
        initial={{
          title: "", slug: "", description: "", cover: "", intro: "",
          readMins: "5", updated: "", keywords: "", relatedSlugs: "",
          sections: [{ h: "", body: "" }], faqs: [], published: false,
        }}
        submitLabel="Publish guide"
        onSubmit={async (data) => {
          const res = await fetch("/api/guides", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok) return out.error ?? "Failed";
          router.push("/admin/guides");
          return null;
        }}
      />
    </div>
  );
}

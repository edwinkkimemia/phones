"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import BlogForm from "../form";

export default function NewBlogPage() {
  const router = useRouter();
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/blog" className="hover:text-brand-700">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">New article</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">New Article</h1>
      <BlogForm
        initial={{ title: "", slug: "", excerpt: "", cover: "", body: "", tags: "", published: false }}
        submitLabel="Publish article"
        onSubmit={async (data) => {
          const res = await fetch("/api/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok) return out.error ?? "Failed";
          router.push("/admin/blog");
          return null;
        }}
      />
    </div>
  );
}

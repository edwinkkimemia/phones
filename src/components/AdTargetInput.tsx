"use client";
import { useEffect, useState } from "react";
import { PRODUCTS } from "@/data/catalog";

export const HOMEPAGE_SLOTS = ["below-hero", "below-deals", "above-footer"];

// Target input with autocomplete suggestions so admins can only pick
// valid slugs: live categories, product slugs, blog posts, guides,
// homepage slots, or "all".
export default function AdTargetInput({
  placement,
  value,
  onChange,
  className = "input",
}: {
  placement: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [posts, setPosts] = useState<{ slug: string; title: string }[]>([]);
  const [guides, setGuides] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCats((d.categories ?? []).map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))))
      .catch(() => null);
    if (placement === "BLOG") {
      fetch("/api/blog")
        .then((r) => r.json())
        .then((d) => setPosts((d.posts ?? []).map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title }))))
        .catch(() => null);
    }
    if (placement === "GUIDES") {
      fetch("/api/guides")
        .then((r) => r.json())
        .then((d) => setGuides((d.guides ?? []).map((g: { slug: string; title: string }) => ({ slug: g.slug, title: g.title }))))
        .catch(() => null);
    }
  }, [placement]);

  const id = `ad-target-${placement}`;
  return (
    <>
      <input
        className={className}
        value={value}
        list={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder="slug or all"
      />
      <datalist id={id}>
        <option value="all">all — every {placement.toLowerCase()} slot</option>
        {placement === "HOMEPAGE" &&
          HOMEPAGE_SLOTS.map((s) => <option key={s} value={s}>{s} (homepage section)</option>)}
        {placement === "CATEGORY" &&
          cats.map((c) => <option key={c.slug} value={c.slug}>{c.name} (category page)</option>)}
        {placement === "PRODUCT" &&
          PRODUCTS.slice(0, 60).map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        {placement === "BLOG" && (
          <>
            <option value="blog">blog (index page)</option>
            {posts.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </>
        )}
        {placement === "GUIDES" && (
          <>
            <option value="guides">guides (index page)</option>
            {guides.map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}
          </>
        )}
      </datalist>
    </>
  );
}

export function targetLabel(target: string, cats: { slug: string; name: string }[]): string {
  if (target === "all") return "all slots";
  const hit = cats.find((c) => c.slug === target);
  if (hit) return hit.name;
  if ((HOMEPAGE_SLOTS as string[]).includes(target)) return `${target} (homepage)`;
  return target;
}

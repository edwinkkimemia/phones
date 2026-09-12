import { notFound, redirect } from "next/navigation";
import { getProduct } from "@/data/catalog";

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  redirect(`/${p.category}/${p.slug}`);
}

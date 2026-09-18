import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog-server";

export const dynamicParams = true;
export const revalidate = 60;

export default async function ProductSlugPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  redirect(`/${p.category}/${p.slug}`);
}

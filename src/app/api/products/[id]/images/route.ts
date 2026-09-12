import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Admin: product gallery management.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const Body = z.object({
    urls: z.array(z.string().url()).min(1).max(8),
    alt: z.string().optional(),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  try {
    const count = await prisma.productImage.count({ where: { productId: params.id } });
    await prisma.productImage.createMany({
      data: parsed.data.urls.map((url, i) => ({
        productId: params.id,
        url,
        alt: parsed.data.alt,
        sortOrder: count + i,
      })),
    });
    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ error: "Connect the database to manage images." }, { status: 503 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const imageId = new URL(req.url).searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
  try {
    await prisma.productImage.deleteMany({ where: { id: imageId, productId: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

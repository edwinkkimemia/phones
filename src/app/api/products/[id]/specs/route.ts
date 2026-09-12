import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// Admin: product specifications management.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const Body = z.object({
    group: z.string().default("General"),
    key: z.string().min(1),
    value: z.string().min(1),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid spec data" }, { status: 400 });
  try {
    const spec = await prisma.productSpec.create({
      data: { productId: params.id, ...parsed.data },
    });
    return NextResponse.json({ spec });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const specId = new URL(req.url).searchParams.get("specId");
  if (!specId) return NextResponse.json({ error: "Missing specId" }, { status: 400 });
  try {
    await prisma.productSpec.deleteMany({ where: { id: specId, productId: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

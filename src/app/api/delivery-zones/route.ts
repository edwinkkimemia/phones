import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Admin delivery-zone management (fees & ETAs shown at checkout).
export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } });
    return NextResponse.json({ source: "db", zones });
  } catch {
    return NextResponse.json({ source: "db", zones: [] });
  }
}

const Body = z.object({
  county: z.string().min(2),
  town: z.string().min(2),
  fee: z.number().int().min(0),
  eta: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid zone data" }, { status: 400 });
  try {
    const zone = await prisma.deliveryZone.create({ data: parsed.data });
    return NextResponse.json({ zone });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

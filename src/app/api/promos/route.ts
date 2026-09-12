import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Admin promo-code management (PromoCode model).
export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json({ source: "db", promos });
  } catch {
    return NextResponse.json({
      source: "static",
      promos: [
        { id: "static-1", code: "TECH10", type: "PERCENTAGE", value: 10, minSubtotal: 10000, active: true, usedCount: 0 },
        { id: "static-2", code: "FLAT500", type: "FIXED", value: 500, minSubtotal: 5000, active: true, usedCount: 0 },
      ],
    });
  }
}

const CreateBody = z.object({
  code: z.string().min(3).max(24),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().positive(),
  minSubtotal: z.number().int().min(0).default(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  endsAt: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid promo data" }, { status: 400 });
  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: parsed.data.code.toUpperCase().trim(),
        type: parsed.data.type as never,
        value: parsed.data.value,
        minSubtotal: parsed.data.minSubtotal,
        usageLimit: parsed.data.usageLimit ?? null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      },
    });
    return NextResponse.json({ promo });
  } catch {
    return NextResponse.json({ error: "Connect the database to manage promos (demo mode is read-only)." }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string; active?: boolean } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const promo = await prisma.promoCode.update({
      where: { id: body.id },
      data: { ...(typeof body.active === "boolean" ? { active: body.active } : {}) },
    });
    return NextResponse.json({ promo });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const limit = Math.min(200, Number(new URL(req.url).searchParams.get("limit") ?? 100) || 100);
  try {
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ source: "db", customers });
  } catch {
    return NextResponse.json({ source: "static", customers: [], note: "Database unavailable — try again." });
  }
}

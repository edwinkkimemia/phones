import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// Admin: customer profile + order history.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = decodeURIComponent(params.id);
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } },
    });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ source: "db", customer });
  } catch {
    return NextResponse.json({ error: "Customer lookup unavailable — try again." }, { status: 503 });
  }
}

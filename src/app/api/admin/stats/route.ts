import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const [orders, products] = await Promise.all([
      prisma.order.findMany({ include: { items: true } }),
      prisma.product.findMany(),
    ]);
    const revenue = orders.filter((o) => o.paymentStatus === "COMPLETED" || o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
    const byProduct = new Map<string, { name: string; sold: number; revenue: number }>();
    for (const o of orders) {
      for (const i of o.items) {
        const cur = byProduct.get(i.productId) ?? { name: i.name, sold: 0, revenue: 0 };
        cur.sold += i.qty; cur.revenue += i.price * i.qty;
        byProduct.set(i.productId, cur);
      }
    }
    const bestSellers = [...byProduct.values()].sort((a, b) => b.sold - a.sold).slice(0, 5);
    return NextResponse.json({
      source: "db",
      revenue,
      orders: orders.length,
      aov: orders.length ? Math.round(revenue / orders.length) : 0,
      bestSellers,
      lowStock: products.filter((p) => p.stockQty <= 8).slice(0, 5).map((p) => ({ name: p.name, qty: p.stockQty })),
      byCategory: [],
    });
  } catch {
    // Database unreachable — report zeros rather than demo data.
    return NextResponse.json({
      source: "db",
      revenue: 0,
      orders: 0,
      aov: 0,
      bestSellers: [],
      lowStock: [],
      byCategory: [],
    });
  }
}

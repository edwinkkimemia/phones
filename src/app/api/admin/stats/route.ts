import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/data/catalog";

export async function GET() {
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
    // Demo stats from static catalog so the dashboard always renders
    const revenue = PRODUCTS.reduce((s, p) => s + p.price * p.soldCount, 0);
    const orders = PRODUCTS.reduce((s, p) => s + p.soldCount, 0);
    return NextResponse.json({
      source: "static",
      revenue, orders,
      aov: Math.round(revenue / Math.max(1, orders)),
      bestSellers: [...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5).map((p) => ({ name: p.name, sold: p.soldCount, revenue: p.price * p.soldCount })),
      lowStock: PRODUCTS.filter((p) => p.stockQty <= 8).map((p) => ({ name: p.name, qty: p.stockQty })),
      byCategory: ["laptops", "desktops", "iphones", "smartphones", "tablets", "wearables", "storage", "laptop-bags", "laptop-parts", "phone-parts", "accessories", "gaming"].map((c) => ({
        category: c,
        revenue: PRODUCTS.filter((p) => p.category === c).reduce((s, p) => s + p.price * p.soldCount, 0),
      })),
    });
  }
}

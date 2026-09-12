import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { orderNumber } from "@/lib/utils";
import { stkPush, normalizePhone } from "@/lib/mpesa";
import { PRODUCTS } from "@/data/catalog";

// ---- Admin: list orders ----
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 50) || 50);
  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(customerId ? { customerId } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ source: "db", orders });
  } catch {
    return NextResponse.json({ source: "static", orders: [], note: "Connect the database for live orders." });
  }
}

const Body = z.object({
  customer: z.object({
    name: z.string().min(3),
    phone: z.string().min(9),
    email: z.string().email().optional().or(z.literal("")),
    town: z.string().optional(),
    address: z.string().min(3),
    landmark: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().min(1).max(10),
    price: z.number().optional(),
    variantLabel: z.string().optional(),
  })).min(1),
  paymentMethod: z.enum(["MPESA", "CARD", "PAY_ON_DELIVERY"]).default("MPESA"),
  deliveryFee: z.number().min(0).default(0),
  promoCode: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data", details: parsed.error.flatten() }, { status: 400 });
  }
  const { customer, items, paymentMethod, deliveryFee, promoCode } = parsed.data;

  // Price from server-side catalog (never trust client totals)
  const priceOf = (id: string): { name: string; price: number; image?: string } | null => {
    const p = PRODUCTS.find((x) => x.id === id || x.slug === id);
    return p ? { name: p.name, price: p.price, image: p.images[0]?.url } : null;
  };

  let subtotal = 0;
  const lines: { dbId: string | null; name: string; price: number; qty: number; image?: string }[] = [];
  // Try DB prices first, fall back to static catalog
  for (const it of items) {
    let line: { dbId: string | null; name: string; price: number; qty: number; image?: string } | null = null;
    try {
      const db = await prisma.product.findFirst({
        where: { OR: [{ id: it.productId }, { slug: it.productId }] },
        include: { images: true },
      });
      if (db) line = { dbId: db.id, name: db.name, price: db.price, qty: it.qty, image: db.images[0]?.url };
    } catch { /* offline */ }
    if (!line) {
      const s = priceOf(it.productId);
      if (!s) return NextResponse.json({ error: `Unknown product: ${it.productId}` }, { status: 400 });
      line = { dbId: null, name: s.name, price: s.price, qty: it.qty, image: s.image };
    }
    subtotal += line.price * line.qty;
    lines.push(line);
  }

  let discount = 0;
  const code = (promoCode ?? "").toUpperCase().trim();
  if (code === "TECH10" && subtotal >= 10000) discount = Math.round(subtotal * 0.1);
  if (code === "FLAT500" && subtotal >= 5000) discount = 500;

  const total = Math.max(0, subtotal + deliveryFee - discount);
  const num = orderNumber();

  let stk: unknown = null;
  if (paymentMethod === "MPESA") {
    try {
      stk = await stkPush({ phone: customer.phone, amount: total, orderNumber: num });
    } catch (e: unknown) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "M-Pesa failed" }, { status: 400 });
    }
  }

  // Persist (best-effort — storefront works even if DB is down)
  try {
    const cust = await prisma.customer.create({
      data: {
        name: customer.name, phone: normalizePhone(customer.phone),
        email: customer.email || null, town: customer.town,
        address: customer.address, landmark: customer.landmark,
      },
    });
    const order = await prisma.order.create({
      data: {
        orderNumber: num, customerId: cust.id,
        status: paymentMethod === "MPESA" ? "PENDING" : "PENDING",
        paymentStatus: paymentMethod === "MPESA" ? "INITIATED" : "PENDING",
        paymentMethod: paymentMethod as never,
        subtotal, deliveryFee, discount, total,
        town: customer.town, address: customer.address, phone: normalizePhone(customer.phone),
        items: {
          create: lines
            .filter((l) => l.dbId)
            .map((l) => ({ productId: l.dbId as string, name: l.name, price: l.price, qty: l.qty, image: l.image })),
        },
        payments: {
          create: {
            method: paymentMethod as never,
            status: paymentMethod === "MPESA" ? "INITIATED" : "PENDING",
            amount: total, phone: normalizePhone(customer.phone),
            checkoutRequestId: (stk as { checkoutRequestId?: string } | null)?.checkoutRequestId,
          },
        },
      },
    });
    return NextResponse.json({ orderNumber: order.orderNumber, total, stk });
  } catch {
    // Static fallback response (demo mode)
    return NextResponse.json({
      orderNumber: num, total, demo: true,
      stk,
      items: lines,
    });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderNumber } from "@/lib/utils";
import { stkPush, normalizePhone } from "@/lib/mpesa";
import { PRODUCTS } from "@/data/catalog";

// ---- Customer + admin: list orders ----
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 50) || 50);
  try {
    // ?mine=1 → only the signed-in customer's own orders.
    if (searchParams.get("mine") === "1") {
      const session = await getServerSession(authOptions);
      const uid = (session?.user as { id?: string } | undefined)?.id;
      const email = session?.user?.email;
      if (!uid && !email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const me = uid
        ? await prisma.user.findUnique({ where: { id: uid } })
        : email
          ? await prisma.user.findFirst({ where: { email } })
          : null;
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            ...(uid ? [{ userId: uid }] : []),
            ...(email ? [{ user: { email } }] : []),
            ...(me?.phone ? [{ phone: me.phone }] : []),
          ],
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ source: "db", orders });
    }
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
    return NextResponse.json({ source: "static", orders: [], note: "Database unavailable — try again." });
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
  if (code) {
    try {
      const promo = await prisma.promoCode.findUnique({ where: { code } });
      const now = new Date();
      const usable =
        promo &&
        promo.active &&
        subtotal >= promo.minSubtotal &&
        !(promo.usageLimit && promo.usedCount >= promo.usageLimit) &&
        !(promo.endsAt && promo.endsAt < now) &&
        !(promo.startsAt && promo.startsAt > now);
      if (usable) {
        discount = promo.type === "PERCENTAGE" ? Math.round((subtotal * promo.value) / 100) : promo.value;
        await prisma.promoCode.update({ where: { code }, data: { usedCount: { increment: 1 } } });
      }
    } catch {
      /* promos unavailable — order proceeds without discount */
    }
  }

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

  // Attach the signed-in customer so orders appear in their dashboard.
  let orderUserId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (uid) {
      const exists = await prisma.user.findUnique({ where: { id: uid } });
      if (exists) orderUserId = uid;
    }
  } catch {
    /* guest checkout */
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
        ...(orderUserId ? { userId: orderUserId } : {}),
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
    // Static fallback response (database unreachable)
    return NextResponse.json({
      orderNumber: num, total,
      stk,
      items: lines,
    });
  }
}

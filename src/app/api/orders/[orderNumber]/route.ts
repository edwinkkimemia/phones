import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  const num = decodeURIComponent(params.orderNumber).toUpperCase().trim();
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: num },
      include: { items: true, payments: true, customer: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found. Check the number and try again." }, { status: 404 });
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        town: order.town,
        address: order.address,
        phone: order.phone,
        notes: order.notes,
        createdAt: order.createdAt,
        customer: order.customer,
        payments: order.payments,
        items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, image: i.image })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Order lookup unavailable — try again in a moment." }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: { params: { orderNumber: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  // Admin status updates
  const body = await req.json().catch(() => ({}));
  const { status, paymentStatus } = body as { status?: string; paymentStatus?: string };
  try {
    const order = await prisma.order.update({
      where: { orderNumber: decodeURIComponent(params.orderNumber) },
      data: {
        ...(status ? { status: status as never } : {}),
        ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
      },
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

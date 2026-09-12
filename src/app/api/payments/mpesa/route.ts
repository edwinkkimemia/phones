import { NextResponse } from "next/server";
import { z } from "zod";
import { stkPush } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  phone: z.string().min(9),
  amount: z.number().positive(),
  orderNumber: z.string().min(3),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid STK request" }, { status: 400 });
  try {
    const result = await stkPush(parsed.data);
    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "STK push failed" }, { status: 400 });
  }
}

// Safaricom Daraja callback — updates payment + order status.
export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  try {
    const stk = body?.Body?.stkCallback;
    const checkoutId: string | undefined = stk?.CheckoutRequestID;
    const success = stk?.ResultCode === 0;
    const receipt = stk?.CallbackMetadata?.Item?.find((x: { Name: string }) => x.Name === "MpesaReceiptNumber")?.Value;
    if (checkoutId) {
      const payment = await prisma.payment.findFirst({ where: { checkoutRequestId: checkoutId } });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: success ? "COMPLETED" : "FAILED", mpesaReceipt: receipt, rawCallback: body as never },
        });
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: success ? "COMPLETED" : "FAILED", status: success ? "PAID" : "PENDING" },
        });
      }
    }
  } catch { /* always ack */ }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

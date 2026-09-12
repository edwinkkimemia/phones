import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Live promo codes only (seeded via PromoCode model) — no hardcoded demo codes.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") ?? "").toUpperCase().trim();
  const subtotal = Number(searchParams.get("subtotal") ?? 0);
  if (!code) return NextResponse.json({ error: "Enter a code" }, { status: 400 });

  try {
    const now = new Date();
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.active)
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
    if (subtotal < promo.minSubtotal)
      return NextResponse.json({ error: `Minimum spend ${promo.minSubtotal.toLocaleString()} for this code` }, { status: 400 });
    if ((promo.usageLimit && promo.usedCount >= promo.usageLimit) || (promo.endsAt && promo.endsAt < now) || (promo.startsAt && promo.startsAt > now))
      return NextResponse.json({ error: "This code has expired" }, { status: 400 });
    const discount =
      promo.type === "PERCENTAGE" ? Math.round((subtotal * promo.value) / 100) : promo.value;
    return NextResponse.json({ code, discount });
  } catch {
    return NextResponse.json({ error: "Promo service unavailable — try again." }, { status: 503 });
  }
}

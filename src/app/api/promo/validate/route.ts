import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo codes always work (even without DB): TECH10 = 10% off, FLAT500 = KES 500 off.
const STATIC_CODES: Record<string, { type: "PERCENTAGE" | "FIXED"; value: number; minSubtotal: number }> = {
  TECH10: { type: "PERCENTAGE", value: 10, minSubtotal: 10000 },
  FLAT500: { type: "FIXED", value: 500, minSubtotal: 5000 },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") ?? "").toUpperCase().trim();
  const subtotal = Number(searchParams.get("subtotal") ?? 0);
  if (!code) return NextResponse.json({ error: "Enter a code" }, { status: 400 });

  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (promo && promo.active && subtotal >= promo.minSubtotal) {
      const discount =
        promo.type === "PERCENTAGE" ? Math.round((subtotal * promo.value) / 100) : promo.value;
      return NextResponse.json({ code, discount });
    }
  } catch {
    /* fall through to static codes */
  }

  const s = STATIC_CODES[code];
  if (!s) return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  if (subtotal < s.minSubtotal)
    return NextResponse.json({ error: `Minimum spend ${s.minSubtotal.toLocaleString()} for this code` }, { status: 400 });
  const discount = s.type === "PERCENTAGE" ? Math.round((subtotal * s.value) / 100) : s.value;
  return NextResponse.json({ code, discount });
}

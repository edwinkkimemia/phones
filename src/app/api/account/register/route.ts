import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/mpesa";

// Public customer registration (storefront). Creates a CUSTOMER user.
export async function POST(req: Request) {
  const Body = z.object({
    name: z.string().min(3, "Enter your full name."),
    email: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
    phone: z.string().min(9, "Enter a valid phone number."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  }
  const { name, password } = parsed.data;
  const email = parsed.data.email ? parsed.data.email.toLowerCase().trim() : null;
  const phone = normalizePhone(parsed.data.phone);
  if (!email && !phone) return NextResponse.json({ error: "Provide an email or phone number." }, { status: 400 });

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with these details already exists. Sign in instead." },
        { status: 409 }
      );
    }
    await prisma.user.create({
      data: { name, email, phone, passwordHash: await bcrypt.hash(password, 10), role: "CUSTOMER" as never },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Registration unavailable — try again." }, { status: 503 });
  }
}

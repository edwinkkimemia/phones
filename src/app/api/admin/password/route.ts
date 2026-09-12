import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Signed-in users can change their own password.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const Body = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    await prisma.user.update({
      where: { email },
      data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}

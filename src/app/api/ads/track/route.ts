import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Public delivery stats: AdSlot beacons { id, event } on view/click.
// No auth — rows are creatives, increments are idempotent counters.
const Body = z.object({
  id: z.string().min(1),
  event: z.enum(["impression", "click"]),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const { id, event } = parsed.data;
  try {
    await prisma.adSlot.update({
      where: { id },
      data:
        event === "impression"
          ? { impressions: { increment: 1 }, lastShownAt: new Date() }
          : { clicks: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Unknown id or DB down — never break the storefront over stats.
    return NextResponse.json({ ok: false });
  }
}

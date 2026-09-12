import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Usage in admin-only API routes:
//   const denied = await requireAdmin();
//   if (denied) return denied;
export async function requireAdmin(): Promise<null | NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if ((session as { role?: string } | null)?.role === "ADMIN") return null;
  } catch {
    /* fall through to 401 */
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

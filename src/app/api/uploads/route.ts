import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 8;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

// Admin image upload. On Vercel with a Blob store connected
// (BLOB_READ_WRITE_TOKEN), files go to permanent blob storage;
// otherwise they are stored under public/uploads/ (self-hosted dev).
// Either way the response is { urls }.
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES);

  if (files.length === 0) return NextResponse.json({ error: "No files received" }, { status: 400 });

  for (const f of files) {
    if (!ALLOWED.includes(f.type))
      return NextResponse.json({ error: `"${f.name}" is not a supported image (JPG/PNG/WebP/AVIF/GIF).` }, { status: 400 });
    if (f.size > MAX_SIZE)
      return NextResponse.json({ error: `"${f.name}" exceeds 5MB.` }, { status: 400 });
  }

  try {
    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    let dir = "";
    if (!useBlob) {
      dir = path.join(process.cwd(), "public", "uploads", stamp);
      await mkdir(dir, { recursive: true });
    }

    const urls: string[] = [];
    for (const f of files) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      if (useBlob) {
        const blob = await put(`uploads/${stamp}/${name}`, f, { access: "public" });
        urls.push(blob.url);
      } else {
        const bytes = Buffer.from(await f.arrayBuffer());
        await writeFile(path.join(dir, name), bytes);
        urls.push(`/uploads/${stamp}/${name}`);
      }
    }
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "Upload failed on the server." }, { status: 500 });
  }
}

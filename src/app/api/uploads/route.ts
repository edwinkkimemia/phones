import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 8;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

// Admin image upload → stores under public/uploads/ and returns public URLs.
// Local disk works for self-hosted dev; for Vercel/serverless use S3/Cloudinary
// (swap this handler — the returned { urls } contract stays the same).
export async function POST(req: Request) {
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
    const d = new Date();
    const dir = path.join(process.cwd(), "public", "uploads", `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`);
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const f of files) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const bytes = Buffer.from(await f.arrayBuffer());
      await writeFile(path.join(dir, name), bytes);
      urls.push(`/uploads/${path.basename(dir)}/${name}`);
    }
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "Upload failed on the server." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAuthed, unauthorized } from "@/lib/admin/guard";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please upload an image file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // On Vercel (or any host with Blob configured) store the image in Blob so it
  // persists; locally fall back to writing into public/uploads.
  if (BLOB_ON) {
    try {
      const blob = await put(`uploads/${name}`, bytes, { access: "public", contentType: file.type, addRandomSuffix: false });
      return NextResponse.json({ url: blob.url });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
    }
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), bytes);
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}

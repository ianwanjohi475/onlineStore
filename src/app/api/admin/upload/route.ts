import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { MAX_DB_MEDIA_BYTES, MEDIA_DB_ON, saveMedia } from "@/lib/store/media";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;

/** Identify the image by its actual bytes (not the browser-supplied type), so a
 *  script or SVG renamed to .jpg can't be uploaded and served from our domain. */
function sniffImage(b: Buffer): { ext: string; type: string } | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", type: "image/png" };
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (b.length > 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a")) return { ext: "gif", type: "image/gif" };
  if (b.length > 12 && b.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(b.toString("ascii", 8, 12))) return { ext: "avif", type: "image/avif" };
  return null;
}

/** Product videos: MP4/MOV (ISO "ftyp" box) or WebM (EBML header). */
function sniffVideo(b: Buffer): { ext: string; type: string } | null {
  if (b.length > 12 && b.toString("ascii", 4, 8) === "ftyp") {
    const brand = b.toString("ascii", 8, 12);
    if (/qt/.test(brand)) return { ext: "mov", type: "video/quicktime" };
    if (!/avif|avis|heic|heix|mif1/.test(brand)) return { ext: "mp4", type: "video/mp4" };
  }
  if (b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { ext: "webm", type: "video/webm" };
  return null;
}
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (file.size > MAX_VIDEO_BYTES) return NextResponse.json({ error: "File is too large" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(bytes) ?? sniffVideo(bytes);
  if (!kind) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP image or an MP4/WebM video" }, { status: 400 });
  if (kind.type.startsWith("image/") && file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${kind.ext}`;

  // On Vercel (or any host with Blob configured) store the image in Blob so it
  // persists; locally fall back to writing into public/uploads.
  if (BLOB_ON) {
    try {
      const blob = await put(`uploads/${name}`, bytes, { access: "public", contentType: kind.type, addRandomSuffix: false });
      return NextResponse.json({ url: blob.url });
    } catch (e) {
      console.error("[upload] blob save failed:", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "Couldn't save the image. Please try again." }, { status: 500 });
    }
  }

  // No Blob store → keep images in the database so uploads still work on Vercel.
  if (MEDIA_DB_ON) {
    if (!kind.type.startsWith("image/")) {
      return NextResponse.json({ error: "Video uploads aren't available here — paste a YouTube link instead." }, { status: 400 });
    }
    if (bytes.length > MAX_DB_MEDIA_BYTES) return NextResponse.json({ error: "Image must be 3MB or smaller" }, { status: 400 });
    try {
      return NextResponse.json({ url: await saveMedia(bytes, kind.type) });
    } catch (e) {
      console.error("[upload] database save failed:", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "Couldn't save the image. Please try again." }, { status: 500 });
    }
  }

  // Local development: write into public/uploads.
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), bytes);
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch {
    return NextResponse.json(
      { error: "Image uploads aren't available yet. Please try again later." },
      { status: 503 },
    );
  }
}

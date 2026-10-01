"use client";

import { upload } from "@vercel/blob/client";

/**
 * Shrink a photo in the browser before uploading: at most `maxSide` pixels on
 * the long edge, re-encoded as WebP (keeps transparency). Phone photos drop
 * from several MB to a few hundred KB, so uploads are quick and pages load fast.
 * GIFs (animation) and files that wouldn't get smaller are left untouched.
 */
export async function compressImage(file: File, maxSide = 1920, quality = 0.86): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.type !== "image/webp" || (blob.size >= file.size && scale === 1)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file; // unsupported format (e.g. HEIC on some browsers) → let the server decide
  }
}

/**
 * Upload a photo or video from the admin.
 * Big files (videos) go straight from the browser to Vercel Blob; if Blob isn't
 * set up, everything goes through /api/admin/upload (database or local disk).
 */
export async function uploadMedia(input: File, onProgress?: (pct: number) => void, opts: { maxSide?: number } = {}): Promise<string> {
  const file = await compressImage(input, opts.maxSide);
  const isVideo = file.type.startsWith("video/");
  if (isVideo || file.size > 4 * 1024 * 1024) {
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60) || "file";
      const blob = await upload(`products/${isVideo ? "videos" : "photos"}/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload/client",
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: (p) => onProgress?.(Math.round(p.percentage)),
      });
      return blob.url;
    } catch (e) {
      // no Blob store → fall back to the server upload below
      if (!(e instanceof Error) || !/501|Direct uploads need|Failed to retrieve the client token/i.test(e.message)) throw e;
    }
  }
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || (res.status === 413 ? "That file is too big. Please use a smaller photo." : "Upload failed"));
  onProgress?.(100);
  return data.url as string;
}

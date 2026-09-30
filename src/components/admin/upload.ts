"use client";

import { upload } from "@vercel/blob/client";

/**
 * Upload a photo or video from the admin.
 * Big files (videos) go straight from the browser to Vercel Blob; if Blob isn't
 * set up (local dev), everything goes through /api/admin/upload instead.
 */
export async function uploadMedia(file: File, onProgress?: (pct: number) => void): Promise<string> {
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
  if (!res.ok) throw new Error(data.error || "Upload failed");
  onProgress?.(100);
  return data.url as string;
}

import type { Product } from "@/lib/types";

/**
 * Product media helpers: the gallery shows the main photo, any extra photos,
 * and an optional video (YouTube / Vimeo link or an uploaded .mp4/.webm).
 */
export type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string; kind: "youtube" | "vimeo" | "file"; embed: string; poster: string | null };

/** Only same-site paths or https URLs are ever rendered. */
export function isSafeMediaUrl(u: unknown): u is string {
  return typeof u === "string" && u.length <= 600 && ((u.startsWith("/") && !u.startsWith("//")) || /^https:\/\/[^\s"'<>]+$/i.test(u));
}

export function parseVideo(url: string | null | undefined): Extract<MediaItem, { type: "video" }> | null {
  if (!url || !isSafeMediaUrl(url)) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) {
    return { type: "video", src: url, kind: "youtube", embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`, poster: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` };
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return { type: "video", src: url, kind: "vimeo", embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1`, poster: null };
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes(".blob.vercel-storage.com/")) {
    return { type: "video", src: url, kind: "file", embed: url, poster: null };
  }
  return null;
}

export function productMedia(p: Product): MediaItem[] {
  const seen = new Set<string>();
  const items: MediaItem[] = [];
  for (const src of [p.image, ...(p.images ?? [])]) {
    if (src && isSafeMediaUrl(src) && !seen.has(src)) {
      seen.add(src);
      items.push({ type: "image", src });
    }
  }
  const video = parseVideo(p.video);
  if (video) items.push(video);
  return items;
}

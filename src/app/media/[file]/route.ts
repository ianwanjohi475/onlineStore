import { readMedia } from "@/lib/store/media";

export const runtime = "nodejs";

/** GET /media/<id>.<ext> — an image uploaded into the database. Ids are random
 *  and content never changes, so browsers and the CDN can cache it for good. */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const media = await readMedia(file.replace(/\.[a-z0-9]+$/i, "")).catch(() => null);
  if (!media || !media.type.startsWith("image/")) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.type,
      "Content-Length": String(media.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}

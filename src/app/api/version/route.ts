import { currentVersion } from "@/lib/store/events";

export const dynamic = "force-dynamic";

/**
 * Tiny, fast endpoint that returns the current store version. Clients poll it
 * and refetch their data only when the number changes. A plain short request —
 * it never holds a connection open, so it can't interfere with navigation.
 */
export async function GET() {
  return Response.json({ version: currentVersion() }, { headers: { "Cache-Control": "no-store" } });
}

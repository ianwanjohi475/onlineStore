import { currentVersion, storeBus, type StoreEvent } from "@/lib/store/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-Sent Events stream. Emits the current store version on connect, then a
 * new event every time the store changes. Clients diff the version and refetch.
 * Carries no sensitive payload — just a version tick — so it is safe to expose
 * to the storefront and the admin alike.
 */
export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* controller already closed */
        }
      };

      // initial snapshot so the client can set its baseline
      send({ version: currentVersion(), scope: "init", at: Date.now() });

      const onChange = (evt: StoreEvent) => send(evt);
      storeBus.on("change", onChange);

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* noop */
        }
      }, 25_000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        storeBus.off("change", onChange);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import "server-only";
import { EventEmitter } from "node:events";

/**
 * A tiny in-process pub/sub used to push real-time updates to connected clients.
 * A single monotonically increasing `version` is bumped on every store write;
 * the SSE endpoint streams it and clients refetch whenever it changes.
 *
 * Stored on globalThis so it survives dev HMR and is shared by every route in
 * the same Node process (this app runs as a single `next start` process).
 */
type Bus = EventEmitter & { version: number };

const g = globalThis as unknown as { __sveStoreBus?: Bus };

function getBus(): Bus {
  if (!g.__sveStoreBus) {
    const bus = new EventEmitter() as Bus;
    bus.setMaxListeners(0);
    bus.version = 0;
    g.__sveStoreBus = bus;
  }
  return g.__sveStoreBus;
}

export const storeBus = getBus();

export interface StoreEvent {
  version: number;
  scope: string;
  at: number;
}

/** Signal that store data changed. Called from writeStore. */
export function bumpStore(scope = "store") {
  storeBus.version += 1;
  const evt: StoreEvent = { version: storeBus.version, scope, at: Date.now() };
  storeBus.emit("change", evt);
  return evt;
}

export function currentVersion() {
  return storeBus.version;
}

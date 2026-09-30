/* SIR VERT ENTERPRISE service worker — offline page + fast repeat loads.
 *
 * Caches ONLY things that never change for a given URL (hashed build files,
 * product images, fonts). It never caches API responses, account data, admin
 * pages or page data — those always come fresh from the server, so prices,
 * stock, order status and sign-in are always current and private.
 */
const VERSION = "v3";
const STATIC_CACHE = `sv-static-${VERSION}`;
const IMG_CACHE = `sv-img-${VERSION}`;
const OFFLINE_URL = "/offline";
const IMG_LIMIT = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/manifest.webmanifest"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Remove every older cache (including the old ones that stored API data).
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC_CACHE, IMG_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isImage(url, req) {
  return req.destination === "image" || url.pathname.startsWith("/_next/image") || /\.(png|jpe?g|webp|avif|gif|svg|ico)$/i.test(url.pathname);
}

async function trimImages() {
  const cache = await caches.open(IMG_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - IMG_LIMIT; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never intercept: other sites, APIs, admin, page data (RSC) requests.
  if (url.origin !== self.location.origin) {
    if (!url.hostname.endsWith(".public.blob.vercel-storage.com")) return;
  } else if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.has("Next-Router-Prefetch")
  ) {
    return;
  }

  // Page loads: always the network; offline page only when there's no connection.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Product images: show the saved copy instantly, refresh it in the background.
  if (isImage(url, request)) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone()).then(trimImages);
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Hashed build files and fonts never change → cache-first.
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
  // Everything else: straight to the network (no caching).
});

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't pick up a stray
  // lockfile in a parent directory (e.g. C:\Users\<you>\package-lock.json).
  outputFileTracingRoot: path.join(__dirname),
  // Don't advertise the framework in response headers.
  poweredByHeader: false,
  // Keep recently visited pages in the browser's router cache so moving between
  // pages (and back) is instant instead of re-fetching every time.
  experimental: {
    staleTimes: { dynamic: 60, static: 300 },
  },
  images: {
    // WebP only — AVIF encoding is much slower on first request and was making
    // images feel sluggish to load. WebP is nearly as small and encodes fast.
    formats: ["image/webp"],
    // Fewer generated sizes = less work per image on first load.
    deviceSizes: [360, 640, 828, 1200, 1920],
    imageSizes: [64, 96, 160, 256, 384],
    // Cache optimized images for a month so they're only processed once.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow admin-uploaded images served from Vercel Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Baseline security headers for every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // No plugins, no <base> hijacking, forms only post back to us, no framing by other sites.
          { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests" },
          // "allow-popups" so the Google sign-in popup can report back to us
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        // Never let admin pages or admin APIs be cached or embedded.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Browsers must always pick up a new service worker straight away.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" }],
      },
      {
        // Account APIs carry personal data — never cache them anywhere.
        source: "/api/auth/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;

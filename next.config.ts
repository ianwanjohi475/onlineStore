import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't pick up a stray
  // lockfile in a parent directory (e.g. C:\Users\<you>\package-lock.json).
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // WebP only — AVIF encoding is much slower on first request and was making
    // images feel sluggish to load. WebP is nearly as small and encodes fast.
    formats: ["image/webp"],
    // Fewer generated sizes = less work per image on first load.
    deviceSizes: [360, 640, 828, 1200, 1920],
    imageSizes: [64, 96, 160, 256, 384],
    // Cache optimized images for a month so they're only processed once.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;

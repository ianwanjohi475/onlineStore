import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const GREEN = "#00c060";
const DARK = "#04150c";

const glyph = (stroke, sw = 1.6) => `
  <g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v6M12 3a5 5 0 0 1 5 5c0 2.5-2 4-5 4s-5-1.5-5-4a5 5 0 0 1 5-5Z"/>
    <path d="M6 14c0 4 2.7 7 6 7s6-3 6-7"/>
  </g>`;

// rounded-square app icon (green bg, white mark)
const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#00e676"/><stop offset="1" stop-color="#00994d"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="24" fill="url(#g)"/>
  <g transform="translate(26 26) scale(2)">${glyph(DARK, 1.8)}</g>
</svg>`;

// maskable: full-bleed green, mark inside safe zone
const maskableSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${GREEN}"/>
  <g transform="translate(32 32) scale(1.5)">${glyph("#ffffff", 1.9)}</g>
</svg>`;

const jobs = [
  ["public/icons/icon-192.png", iconSvg(192), 192],
  ["public/icons/icon-512.png", iconSvg(512), 512],
  ["public/icons/maskable-192.png", maskableSvg(192), 192],
  ["public/icons/maskable-512.png", maskableSvg(512), 512],
  ["public/icons/apple-touch-icon.png", iconSvg(180), 180],
  ["public/icon.png", iconSvg(512), 512],
  ["public/apple-icon.png", iconSvg(180), 180],
  ["public/favicon-32.png", iconSvg(32), 32],
];

for (const [out, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log("✓", out);
}
console.log("icons done");

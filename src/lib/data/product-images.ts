/**
 * Product photography, keyed by product slug.
 *
 * These default to real, keyword-matched online photos (LoremFlickr) so the store
 * shows genuine product imagery out of the box. They load when the app runs with
 * internet access; if any image fails, <ProductImage> falls back to a studio render.
 *
 * TO USE EXACT PRODUCT SHOTS:
 *   1. Drop a photo into `public/products/` (e.g. `public/products/freepods-4-pro.jpg`)
 *   2. Point the slug at it below: `"freepods-4-pro": "/products/freepods-4-pro.jpg",`
 *   Local paths (starting with "/") are served optimised via next/image.
 */

// Real keyword-matched online photos. `lock` keeps each image stable across reloads.
const flickr = (keywords: string, lock: number) =>
  `https://loremflickr.com/700/700/${keywords}?lock=${lock}`;

export const productImages: Record<string, string> = {
  "freepods-4-pro": flickr("earbuds", 21),
  "freepods-lite": flickr("earbuds,wireless", 22),
  "openring-air": flickr("earphones", 23),
  "watch-meta-ultra": flickr("smartwatch", 31),
  "watch-fit-2": flickr("smartwatch,fitness", 32),
  "powercore-27000": flickr("powerbank,charger", 41),
  "powerslim-10000": flickr("charger,battery", 42),
  "gan-cube-67w": flickr("charger,usb", 51),
  "magpad-wireless": flickr("wireless,charger", 52),
  "ultrabraid-usb-c-100w": flickr("usb,cable", 61),
  "lightningflow-3-in-1": flickr("cable,charger", 62),
  "soundgo-boom": flickr("speaker,bluetooth", 71),
  "soundgo-mini": flickr("speaker", 72),
  "halo-ring-light": flickr("light,studio", 81),
  "flexstand-pro": flickr("phone,stand", 82),
  "freepods-studio": flickr("earbuds,audio", 24),
  "sportbuds-active": flickr("earphones,sport", 25),
  "watch-meta-lite": flickr("smartwatch,watch", 33),
  "watch-kids-gps": flickr("smartwatch", 34),
  "powercore-10k-maggo": flickr("powerbank,charger", 43),
  "solarcharge-20000": flickr("solar,charger", 44),
  "gan-tower-100w": flickr("charger,plug", 53),
  "carcharge-45w": flickr("car,charger", 54),
  "ultrabraid-lightning-27w": flickr("cable,charger", 63),
  "datalink-usb-c-240w": flickr("usb,cable", 64),
  "soundgo-party-80w": flickr("speaker,party", 73),
  "soundbar-cinema": flickr("soundbar,speaker", 74),
  "airtag-locator": flickr("keychain,gadget", 83),
  "gripcase-clear": flickr("phone,case", 84),
};

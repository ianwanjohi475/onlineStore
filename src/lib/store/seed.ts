import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { productImages } from "@/lib/data/product-images";
import type { StoreData } from "@/lib/types";

/** Default store contents — used to seed data/store.json on first run. */
export const seed: StoreData = {
  products: products.map((p) => ({ ...p, image: productImages[p.slug] ?? null })),
  categories,
  settings: {
    brandName: "Oraimo",
    heroTagline: "Smart accessories, powered for life.",
    announcements: [
      { text: "Flash Sale — up to 40% off audio", href: "/flash-sales", cta: "Shop deals" },
      { text: "Free next-day delivery in Nairobi over KES 5,000", href: "/shop", cta: "Start shopping" },
      { text: "12-month warranty on every genuine product", href: "/about#warranty", cta: "Learn more" },
    ],
    heroSlides: [
      { slug: "watch-meta-ultra", eyebrow: "Flagship wearable", title: "Watch Meta Ultra", copy: "AMOLED · on-wrist calling · 14-day battery", from: "#0b3d2e", to: "#022018" },
      { slug: "freepods-4-pro", eyebrow: "Adaptive ANC", title: "FreePods 4 Pro", copy: "Titanium drivers · 48h playtime · silence on demand", from: "#052e1c", to: "#0a2540" },
      { slug: "soundgo-party-80w", eyebrow: "Turn it up", title: "SoundGo Party 80W", copy: "80W stereo · reactive lights · karaoke ready", from: "#123524", to: "#1a1a1a" },
    ],
    freeShipThreshold: 5000,
    shippingFee: 300,
    whatsapp: "254700000000",
    promos: [
      { code: "ORAIMO10", kind: "percent", value: 10, label: "10% off your order" },
      { code: "WELCOME5", kind: "percent", value: 5, label: "5% welcome discount" },
      { code: "FREESHIP", kind: "ship", label: "Free shipping" },
    ],
  },
};

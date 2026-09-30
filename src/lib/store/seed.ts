import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { testimonials } from "@/lib/data/content";
import type { Brand, Order, StoreData } from "@/lib/types";

const seededProducts = products.map((p, i) => ({
  ...p,
  // Default to the clean studio render; upload a real photo per product in the admin.
  image: p.image ?? null,
  brand:
    p.brand ??
    (["earbuds", "speakers", "smartwatches", "power-banks", "chargers", "cables"].includes(p.category)
      ? "oraimo"
      : "generic"),
  stock: p.stock ?? (p.inStock ? 6 + ((i * 7) % 90) : 0),
}));

const brands: Brand[] = [
  { slug: "oraimo", name: "Oraimo", color: "#00E676" },
  { slug: "hp", name: "HP", color: "#0096D6" },
  { slug: "generic", name: "SIR VERT Select", color: "#7CFF6B" },
];

// The store starts with a clean slate — real orders and customers only.
const orders: Order[] = [];

/** Default store contents — used to seed data/store.json on first run. */
export const seed: StoreData = {
  products: seededProducts,
  categories,
  brands,
  testimonials,
  orders,
  suspendedCustomers: [],
  settings: {
    brandName: "SIR VERT ENTERPRISE",
    heroTagline: "High-end products & services. When you call, we answer.",
    announcements: [
      { text: "Networking services — fibre splicing, WiFi & router setup", href: "/services", cta: "Book now" },
      { text: "Free delivery within Nairobi on orders over KES 5,000", href: "/shop", cta: "Start shopping" },
      { text: "Genuine products with warranty — talk to us on WhatsApp", href: "/contact", cta: "Contact us" },
    ],
    heroSlides: [
      { id: "slide-1", slug: "watch-nova-am", eyebrow: "Smartwatch deals", title: "Watch Nova AM", headline: "Vivid AMOLED, ultimate power", subtitle: "", copy: "AMOLED display · on-wrist calling · up to 24-day standby.", buttonText: "Shop now", buttonLink: "/product/watch-nova-am", from: "#e9dcff", to: "#7c3aed", overlay: 0, active: true },
      { id: "slide-2", slug: "wireless-charger", eyebrow: "Charging week", title: "PowerDock 15W", headline: "15W safe & fast wireless charging", subtitle: "", copy: "AniFast wireless charging, engineered for iOS & Android.", buttonText: "Shop now", buttonLink: "/product/wireless-charger", from: "#c6f0e8", to: "#0d9488", overlay: 0, active: true },
      { id: "slide-3", slug: "boompop-pro", eyebrow: "Sound sale", title: "BoomPop Pro", headline: "Thunderous bass, infinite lights", subtitle: "", copy: "20W stereo · beat-adaptive lights · IPX6 splash-proof.", buttonText: "Shop now", buttonLink: "/product/boompop-pro", from: "#ffe2c9", to: "#ea580c", overlay: 0, active: true },
      { id: "slide-4", slug: "powerbank-q21", eyebrow: "Power up", title: "Powerbank Q21", headline: "20,000mAh that never quits", subtitle: "", copy: "22.5W fast charge · digital display · charges 3 devices.", buttonText: "Shop now", buttonLink: "/product/powerbank-q21", from: "#d3e8ff", to: "#2563eb", overlay: 0, active: true },
    ],
    freeShipThreshold: 5000,
    shippingFee: 300,
    whatsapp: "254799239739",
    promos: [
      { code: "SIRVERT10", kind: "percent", value: 10, label: "10% off your order" },
      { code: "WELCOME5", kind: "percent", value: 5, label: "5% welcome discount" },
      { code: "FREESHIP", kind: "ship", label: "Free shipping" },
    ],
    seoTitle: "SIR VERT ENTERPRISE — Electronics, Smart Gadgets & Networking Services",
    seoDescription: "Shop genuine earbuds, smartwatches, power banks, chargers, home appliances and computer accessories. Plus networking services — fibre splicing, WiFi installation, router configuration and PC repair. Fast delivery across Kenya.",
    supportEmail: "sales@sirvertenterprise.co.ke",
    address: "Nairobi CBD, Kenya",
    footerBlurb: "SIR VERT ENTERPRISE focuses on high-end services to all our customers, making sure they attain and experience the best service and products. When you call, we answer.",
    socials: [
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
};

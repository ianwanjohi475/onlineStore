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
      { id: "slide-1", slug: "watch-nova-am", eyebrow: "Wearables", title: "Watch Nova AM", subtitle: "", copy: "AMOLED · on-wrist calling · 10-day battery", buttonText: "Shop now", buttonLink: "/product/watch-nova-am", from: "#0b3d2e", to: "#022018", overlay: 0, active: true },
      { id: "slide-2", slug: "powerbank-q21", eyebrow: "Power that lasts", title: "Powerbank Q21", subtitle: "", copy: "20,000mAh · 22.5W fast charge · digital display", buttonText: "Shop now", buttonLink: "/product/powerbank-q21", from: "#052e1c", to: "#0a2540", overlay: 0, active: true },
      { id: "slide-3", slug: "boompop-pro", eyebrow: "Turn it up", title: "BoomPop Pro", subtitle: "", copy: "20W stereo · deep bass · IPX6 splash-proof", buttonText: "Shop now", buttonLink: "/product/boompop-pro", from: "#123524", to: "#1a1a1a", overlay: 0, active: true },
      { id: "slide-4", slug: "services", eyebrow: "Networking services", title: "Fibre, WiFi & PC repair", subtitle: "", copy: "Fibre splicing · WiFi installation · router config · PC repair", buttonText: "Explore services", buttonLink: "/services", from: "#0a2540", to: "#052e1c", overlay: 0, active: true },
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

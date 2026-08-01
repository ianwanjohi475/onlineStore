import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { testimonials } from "@/lib/data/content";
import type { Brand, Order, OrderEvent, OrderStatus, PaymentStatus, StoreData } from "@/lib/types";

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

const statuses: OrderStatus[] = [
  "delivered", "delivered", "shipped", "processing", "pending",
  "delivered", "cancelled", "out-for-delivery", "confirmed", "packed",
];
const buyers = [
  ["Amina Yusuf", "amina@example.com", "Nairobi"],
  ["Brian Otieno", "brian@example.com", "Kisumu"],
  ["Grace Wambui", "grace@example.com", "Nakuru"],
  ["Daniel Mwangi", "daniel@example.com", "Mombasa"],
  ["Faith Chebet", "faith@example.com", "Eldoret"],
  ["Kevin Kamau", "kevin@example.com", "Thika"],
  ["Mercy Achieng", "mercy@example.com", "Nyeri"],
  ["Samuel Kiptoo", "samuel@example.com", "Nairobi"],
  ["Janet Njeri", "janet@example.com", "Nairobi"],
  ["Peter Omondi", "peter@example.com", "Machakos"],
];

function labelFor(s: OrderStatus): string {
  return {
    pending: "Order placed",
    confirmed: "Order confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    "out-for-delivery": "Out for delivery",
    delivered: "Delivered",
    cancelled: "Order cancelled",
    refunded: "Refunded",
    returned: "Returned",
  }[s];
}

/** Map a fulfilment status to a sensible payment status for seeded data. */
function paymentFor(status: OrderStatus, i: number): PaymentStatus {
  if (status === "cancelled") return i % 2 === 0 ? "refunded" : "failed";
  if (status === "pending" || status === "confirmed") return i % 3 === 0 ? "pending" : "paid";
  return "paid";
}

const orders: Order[] = buyers.map((b, i) => {
  const p1 = seededProducts[i % seededProducts.length];
  const p2 = seededProducts[(i * 3 + 2) % seededProducts.length];
  const items = [
    { slug: p1.slug, name: p1.name, quantity: 1 + (i % 2), price: p1.price },
    ...(i % 2 === 0 ? [{ slug: p2.slug, name: p2.name, quantity: 1, price: p2.price }] : []),
  ];
  const subtotal = items.reduce((n, it) => n + it.price * it.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;
  const status = statuses[i];
  const paymentStatus = paymentFor(status, i);
  const placed = new Date(2026, 6, 30 - i * 3);
  const method = i % 3 === 0 ? "Card" : i % 3 === 1 ? "M-Pesa" : "Cash on Delivery";

  // build a timeline that reflects the order's current state
  const flow: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out-for-delivery", "delivered"];
  const reached = status === "cancelled" ? (["pending", "confirmed"] as OrderStatus[]) : flow.slice(0, Math.max(1, flow.indexOf(status) + 1));
  const timeline: OrderEvent[] = reached.map((s, k) => ({
    at: new Date(placed.getTime() + k * 6 * 3600_000).toISOString(),
    label: labelFor(s),
  }));
  if (status === "cancelled") timeline.push({ at: new Date(placed.getTime() + 12 * 3600_000).toISOString(), label: "Order cancelled" });

  return {
    id: `SVE-${482910 - i * 137}`,
    number: `#SVE-${482910 - i * 137}`,
    date: placed.toISOString(),
    status,
    paymentStatus,
    items,
    subtotal,
    shipping,
    discount: 0,
    total,
    payment: method,
    transactionId:
      method === "M-Pesa" ? `MPE${7 + i}${(100000 + i * 4321).toString(36).toUpperCase()}`
      : method === "Card" ? `CARD-${900000 + i * 731}`
      : `COD-${482910 - i * 137}`,
    refunded: paymentStatus === "refunded" ? total : 0,
    customer: { name: b[0], email: b[1], phone: "+2547" + (10000000 + i * 111111), address: `${100 + i} Kimathi St`, city: b[2] },
    timeline,
    notes: [],
  };
});

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

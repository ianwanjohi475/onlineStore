import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { testimonials } from "@/lib/data/content";
import type { Brand, Order, OrderStatus, StoreData } from "@/lib/types";

const seededProducts = products.map((p, i) => ({
  ...p,
  // Default to the clean, consistent studio render; add real photo URLs in the admin.
  image: null,
  brand: ["oraimo", "oraimo-pro", "oraimo-fit"][i % 3],
  stock: p.inStock ? 8 + ((i * 7) % 90) : 0,
}));

const brands: Brand[] = [
  { slug: "oraimo", name: "Oraimo", color: "#00E676" },
  { slug: "oraimo-pro", name: "Oraimo Pro", color: "#34F5C5" },
  { slug: "oraimo-fit", name: "Oraimo Fit", color: "#7CFF6B" },
];

const statuses: OrderStatus[] = ["delivered", "delivered", "shipped", "processing", "pending", "delivered", "cancelled", "shipped"];
const buyers = [
  ["Amina Yusuf", "amina@example.com", "Nairobi"],
  ["Brian Otieno", "brian@example.com", "Kisumu"],
  ["Grace Wambui", "grace@example.com", "Nakuru"],
  ["Daniel Mwangi", "daniel@example.com", "Mombasa"],
  ["Faith Chebet", "faith@example.com", "Eldoret"],
  ["Kevin Kamau", "kevin@example.com", "Thika"],
  ["Mercy Achieng", "mercy@example.com", "Nyeri"],
  ["Samuel Kiptoo", "samuel@example.com", "Nairobi"],
];

const orders: Order[] = buyers.map((b, i) => {
  const p1 = seededProducts[i % seededProducts.length];
  const p2 = seededProducts[(i * 3 + 2) % seededProducts.length];
  const items = [
    { slug: p1.slug, name: p1.name, quantity: 1 + (i % 2), price: p1.price },
    ...(i % 2 === 0 ? [{ slug: p2.slug, name: p2.name, quantity: 1, price: p2.price }] : []),
  ];
  const subtotal = items.reduce((n, it) => n + it.price * it.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const d = new Date(2026, 6, 30 - i * 3);
  return {
    id: `ORA-${482910 - i * 137}`,
    number: `#ORA-${482910 - i * 137}`,
    date: d.toISOString(),
    status: statuses[i],
    items,
    subtotal,
    shipping,
    discount: 0,
    total: subtotal + shipping,
    payment: i % 2 === 0 ? "M-Pesa" : "Card",
    customer: { name: b[0], email: b[1], phone: "+2547" + (10000000 + i * 111111), address: `${100 + i} Kimathi St`, city: b[2] },
  };
});

/** Default store contents — used to seed data/store.json on first run. */
export const seed: StoreData = {
  products: seededProducts,
  categories,
  brands,
  testimonials,
  orders,
  settings: {
    brandName: "Oraimo",
    heroTagline: "Smart accessories, powered for life.",
    announcements: [
      { text: "Flash Sale — up to 40% off audio", href: "/flash-sales", cta: "Shop deals" },
      { text: "Free next-day delivery in Nairobi over KES 5,000", href: "/shop", cta: "Start shopping" },
      { text: "12-month warranty on every genuine product", href: "/about#warranty", cta: "Learn more" },
    ],
    heroSlides: [
      { id: "slide-1", slug: "watch-meta-ultra", eyebrow: "Flagship wearable", title: "Watch Meta Ultra", subtitle: "", copy: "AMOLED · on-wrist calling · 14-day battery", buttonText: "Shop now", buttonLink: "/product/watch-meta-ultra", from: "#0b3d2e", to: "#022018", overlay: 0, active: true },
      { id: "slide-2", slug: "freepods-4-pro", eyebrow: "Adaptive ANC", title: "FreePods 4 Pro", subtitle: "", copy: "Titanium drivers · 48h playtime · silence on demand", buttonText: "Shop now", buttonLink: "/product/freepods-4-pro", from: "#052e1c", to: "#0a2540", overlay: 0, active: true },
      { id: "slide-3", slug: "soundgo-party-80w", eyebrow: "Turn it up", title: "SoundGo Party 80W", subtitle: "", copy: "80W stereo · reactive lights · karaoke ready", buttonText: "Shop now", buttonLink: "/product/soundgo-party-80w", from: "#123524", to: "#1a1a1a", overlay: 0, active: true },
    ],
    freeShipThreshold: 5000,
    shippingFee: 300,
    whatsapp: "254700000000",
    promos: [
      { code: "ORAIMO10", kind: "percent", value: 10, label: "10% off your order" },
      { code: "WELCOME5", kind: "percent", value: 5, label: "5% welcome discount" },
      { code: "FREESHIP", kind: "ship", label: "Free shipping" },
    ],
    seoTitle: "Oraimo — Smart Accessories, Powered for Life",
    seoDescription: "Shop genuine Oraimo earbuds, smartwatches, power banks, chargers, cables and speakers. Fast delivery across Kenya, 12-month warranty.",
    supportEmail: "help@oraimo.example",
    address: "Kimathi Street, Nairobi CBD",
    footerBlurb: "Smart accessories, powered for life. Genuine Oraimo audio, wearables and power — delivered fast across Kenya and backed by a real warranty.",
    socials: [
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
};

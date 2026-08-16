import type { CategorySlug, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

/**
 * The live product catalogue for SIR VERT ENTERPRISE.
 * Prices are in KES. Photos can be uploaded per product from the admin dashboard;
 * until then a clean studio render stands in for each item.
 */

type Seed = {
  name: string;
  tagline: string;
  category: CategorySlug;
  price: number;
  compareAt?: number;
  rating?: number;
  reviewCount?: number;
  accent?: string;
  colors?: string[];
  badges?: Product["badges"];
  features?: string[];
  specs?: Record<string, string>;
  inStock?: boolean;
  stock?: number;
  brand?: string;
  soldPercent?: number;
  description?: string;
  image?: string | null;
};

// A varied, premium accent per category so product renders aren't all green —
// green stays the brand colour, but the catalogue feels colourful, like a real marketplace.
const accentByCategory: Record<CategorySlug, string> = {
  earbuds: "#22D3EE",       // cyan
  speakers: "#A78BFA",      // violet
  smartwatches: "#38BDF8",  // sky
  "power-banks": "#34D399", // emerald
  chargers: "#FBBF24",      // amber
  cables: "#F472B6",        // pink
  "home-appliances": "#60A5FA", // blue
  computing: "#818CF8",     // indigo
  cameras: "#2DD4BF",       // teal
  accessories: "#FB923C",   // orange
  "new-arrivals": "#00E676", // brand green
};

/**
 * The uploaded product photos are shot on green shop shelves, which makes the
 * whole storefront look green and less premium. So by default the catalogue
 * uses the clean studio renders (see ProductArt). The real photos are still in
 * the repo and can be turned back on by flipping this flag, or replaced one by
 * one with proper white-background shots from Admin → Products.
 */
const USE_SHELF_PHOTOS = false;

/** Real product photography keyed by slug (currently off — see USE_SHELF_PHOTOS). */
const photoBySlug: Record<string, string> = {
  spacebuds: "/products/spacebuds.jpg",
  "spacebuds-neo": "/products/spacebuds-neo.jpg",
  "spacebuds-lite": "/products/spacebuds-lite.jpg",
  "open-arc": "/products/open-arc.jpg",
  "open-circlet-2": "/products/open-circlet-2.jpg",
  "necklace-5": "/products/necklace-5.jpg",
  "gaming-headphone": "/products/gaming-headphone.jpg",
  "boompop-pro": "/products/boompop-pro.jpg",
  "boompop-lite": "/products/boompop-lite.jpg",
  "watch-6-lite": "/products/watch-6-lite.jpg",
  "watch-5": "/products/watch-5.jpg",
  "watch-lumos-n": "/products/watch-lumos-n.jpg",
  "watch-nova-am": "/products/watch-nova-am.jpg",
  "watch-muse": "/products/watch-muse.jpg",
  "watch-nova-2-lite": "/products/watch-nova-2-lite.jpg",
  "powerbank-q21": "/products/powerbank-q21.jpg",
  "poweromni-251": "/products/poweromni-251.jpg",
  "45w-gan-ultra-fast": "/products/45w-gan-ultra-fast.jpg",
  "20w-rapid-charger": "/products/20w-rapid-charger.jpg",
  "18w-car-charger": "/products/18w-car-charger.jpg",
  "100w-fast-charging-cable": "/products/100w-fast-charging-cable.jpg",
  "wireless-charger": "/products/wireless-charger.jpg",
};


function make(seed: Seed): Product {
  const slug = slugify(seed.name);
  const rating = seed.rating ?? 4.6;
  return {
    id: slug,
    slug,
    name: seed.name,
    tagline: seed.tagline,
    category: seed.category,
    price: seed.price,
    compareAt: seed.compareAt,
    rating,
    reviewCount: seed.reviewCount ?? Math.round(38 + rating * 90),
    accent: seed.accent ?? accentByCategory[seed.category] ?? "#00E676",
    colors: seed.colors ?? ["#0B3D2E", "#F5F5F5"],
    badges: seed.badges ?? [],
    features: seed.features ?? [],
    specs: seed.specs ?? {},
    inStock: seed.inStock ?? true,
    stock: seed.stock,
    brand: seed.brand,
    soldPercent: seed.soldPercent,
    description:
      seed.description ??
      `${seed.name} — ${seed.tagline}. Genuine stock, sold and supported by SIR VERT ENTERPRISE with warranty and fast delivery across Kenya.`,
    image: seed.image ?? (USE_SHELF_PHOTOS ? photoBySlug[slug] : null) ?? null,
  };
}

const raw: Seed[] = [
  /* ── Earbuds & Audio ──────────────────────────────────────── */
  {
    name: "SpaceBuds",
    tagline: "True-wireless · deep bass",
    category: "earbuds",
    price: 4900,
    rating: 4.8,
    badges: ["bestseller"],
    soldPercent: 78,
    features: ["Punchy bass tuning", "ENC clear calls", "Up to 30h with case", "Touch controls"],
    specs: { Driver: "12mm dynamic", Battery: "6h + 24h case", Bluetooth: "5.3", Water: "IPX4" },
    description:
      "SpaceBuds deliver full, punchy sound with clear-call noise cancellation and all-day battery — the everyday earbud that just works.",
  },
  {
    name: "SpaceBuds Neo+",
    tagline: "Comfort fit · quick pair",
    category: "earbuds",
    price: 2500,
    rating: 4.6,
    features: ["Lightweight shell", "Fast Bluetooth pairing", "24h total playtime", "Touch controls"],
    specs: { Driver: "10mm", Battery: "5h + 19h case", Bluetooth: "5.3", Water: "IPX4" },
  },
  {
    name: "SpaceBuds Lite",
    tagline: "Everyday wireless sound",
    category: "earbuds",
    price: 1900,
    compareAt: 2400,
    rating: 4.5,
    badges: ["sale"],
    soldPercent: 64,
    features: ["Balanced audio", "ENC calls", "Low-latency mode", "USB-C charging"],
    specs: { Driver: "10mm", Battery: "5h + 15h case", Bluetooth: "5.2", Water: "IPX4" },
  },
  {
    name: "Open Arc",
    tagline: "Open-ear · aware of the world",
    category: "earbuds",
    price: 6200,
    rating: 4.7,
    badges: ["new"],
    features: ["Open-ear air-conduction", "Secure over-ear hook", "Sweat resistant", "16h playtime"],
    specs: { Type: "Open-ear", Battery: "16h", Bluetooth: "5.3", Water: "IPX5" },
    description:
      "Open Arc rests just outside the ear so you hear your music and your surroundings at once — ideal for runners and commuters who want to stay aware.",
  },
  {
    name: "Open Circlet 2",
    tagline: "Air-conduction · all-day comfort",
    category: "earbuds",
    price: 5300,
    rating: 4.6,
    badges: ["new"],
    features: ["Open-ear design", "Feather-light band", "Clear-call mics", "Fast charge"],
    specs: { Type: "Open-ear", Battery: "14h", Bluetooth: "5.3", Water: "IPX4" },
  },
  {
    name: "Necklace Lite",
    tagline: "Neckband · magnetic buds",
    category: "earbuds",
    price: 1700,
    rating: 4.4,
    features: ["Around-neck comfort", "Magnetic earbuds", "Up to 20h playtime", "Call controls"],
    specs: { Type: "Neckband", Battery: "20h", Bluetooth: "5.2", Water: "IPX5" },
  },
  {
    name: "Necklace 5",
    tagline: "Neckband · deep bass",
    category: "earbuds",
    price: 3300,
    rating: 4.6,
    features: ["Rich bass drivers", "Fast charge", "Up to 30h playtime", "Magnetic power on/off"],
    specs: { Type: "Neckband", Battery: "30h", Bluetooth: "5.3", Water: "IPX5" },
  },
  {
    name: "Earphones",
    tagline: "Wired · crisp & clear",
    category: "earbuds",
    price: 300,
    rating: 4.3,
    features: ["3.5mm wired", "In-line mic", "Tangle-resistant cable", "Universal fit"],
    specs: { Type: "Wired", Jack: "3.5mm", Mic: "In-line", Cable: "1.2m" },
  },

  /* ── Speakers & Headphones ────────────────────────────────── */
  {
    name: "BoomPop Pro",
    tagline: "Big room-filling sound",
    category: "speakers",
    price: 6500,
    compareAt: 7500,
    rating: 4.8,
    badges: ["bestseller"],
    soldPercent: 71,
    features: ["Stereo pairing", "Deep bass radiator", "12h playtime", "IPX6 splash-proof"],
    specs: { Output: "20W", Battery: "12h", Bluetooth: "5.3", Water: "IPX6" },
    description:
      "BoomPop Pro fills the room with loud, clean stereo and deep bass, pairs with a second unit for true stereo, and shrugs off splashes at the pool or park.",
  },
  {
    name: "BoomPop Lite",
    tagline: "Pocket speaker · loud & clear",
    category: "speakers",
    price: 3000,
    rating: 4.6,
    features: ["Compact & portable", "Clear mids and highs", "8h playtime", "Splash resistant"],
    specs: { Output: "10W", Battery: "8h", Bluetooth: "5.2", Water: "IPX5" },
  },
  {
    name: "Gaming Headphone",
    tagline: "Immersive · boom mic",
    category: "speakers",
    price: 2899,
    compareAt: 3499,
    rating: 4.5,
    badges: ["new"],
    features: ["Surround-style audio", "Detachable boom mic", "RGB accents", "Cushioned earcups"],
    specs: { Driver: "50mm", Mic: "Boom", Connection: "3.5mm / USB", Lighting: "RGB" },
  },

  /* ── Smartwatches ─────────────────────────────────────────── */
  {
    name: "Watch 5",
    tagline: "AMOLED · fitness tracking",
    category: "smartwatches",
    price: 3800,
    compareAt: 4600,
    rating: 4.6,
    badges: ["bestseller"],
    soldPercent: 62,
    features: ["Bright AMOLED screen", "Heart-rate & SpO2", "100+ sport modes", "7-day battery"],
    specs: { Display: "1.43\" AMOLED", Battery: "7 days", Water: "IP68", Health: "HR · SpO2" },
  },
  {
    name: "Watch 6R",
    tagline: "Rugged · always-on display",
    category: "smartwatches",
    price: 3500,
    rating: 4.5,
    features: ["Durable build", "Always-on display", "Sleep tracking", "Bluetooth calling"],
    specs: { Display: "1.43\" AMOLED", Battery: "7 days", Water: "IP68", Calls: "Bluetooth" },
  },
  {
    name: "Watch Nova AM",
    tagline: "Slim · on-wrist calling",
    category: "smartwatches",
    price: 5700,
    rating: 4.7,
    badges: ["new"],
    features: ["On-wrist calling", "AMOLED always-on", "AI health insights", "Fast-charge"],
    specs: { Display: "1.45\" AMOLED", Battery: "10 days", Water: "IP68", Calls: "Bluetooth" },
  },
  {
    name: "Watch Lumos N",
    tagline: "Bright display · light on the wrist",
    category: "smartwatches",
    price: 2500,
    rating: 4.4,
    features: ["Vivid display", "Step & sleep tracking", "Multiple watch faces", "Long battery"],
    specs: { Display: "1.39\"", Battery: "7 days", Water: "IP67", Health: "HR" },
  },
  {
    name: "Watch 6 Nano",
    tagline: "Compact · everyday tracker",
    category: "smartwatches",
    price: 2500,
    rating: 4.4,
    features: ["Slim & light", "Heart-rate monitor", "Notifications", "5-day battery"],
    specs: { Display: "1.32\"", Battery: "5 days", Water: "IP67", Health: "HR" },
  },
  {
    name: "Watch 5R",
    tagline: "Sport · GPS-ready",
    category: "smartwatches",
    price: 4700,
    rating: 4.6,
    features: ["Connected GPS", "100+ sport modes", "AMOLED display", "10-day battery"],
    specs: { Display: "1.43\" AMOLED", Battery: "10 days", Water: "5ATM", GPS: "Connected" },
  },
  {
    name: "Watch Nova 2 Lite",
    tagline: "Big screen · calling",
    category: "smartwatches",
    price: 4400,
    rating: 4.5,
    features: ["Large AMOLED", "Bluetooth calling", "Health suite", "Fast charge"],
    specs: { Display: "1.85\" AMOLED", Battery: "7 days", Water: "IP68", Calls: "Bluetooth" },
  },
  {
    name: "Watch Muse",
    tagline: "Premium · metal finish",
    category: "smartwatches",
    price: 5200,
    rating: 4.7,
    badges: ["bestseller"],
    soldPercent: 55,
    features: ["Metal body", "AMOLED always-on", "Bluetooth calling", "AI coach"],
    specs: { Display: "1.43\" AMOLED", Battery: "10 days", Water: "IP68", Body: "Alloy" },
  },
  {
    name: "Watch 6 Lite",
    tagline: "Value smartwatch",
    category: "smartwatches",
    price: 2700,
    rating: 4.4,
    features: ["Clear display", "Fitness tracking", "Notifications", "Long battery"],
    specs: { Display: "1.4\"", Battery: "7 days", Water: "IP67", Health: "HR · SpO2" },
  },
  {
    name: "Watch 5 Lite Pink",
    tagline: "Style meets fitness",
    category: "smartwatches",
    price: 2700,
    rating: 4.5,
    accent: "#F472B6",
    colors: ["#F472B6", "#F5F5F5"],
    features: ["Pink finish", "Heart-rate & SpO2", "Sport modes", "7-day battery"],
    specs: { Display: "1.43\" AMOLED", Battery: "7 days", Water: "IP68", Health: "HR · SpO2" },
  },
  {
    name: "Kid's Smartwatch",
    tagline: "GPS · calls · SOS",
    category: "smartwatches",
    price: 7100,
    rating: 4.6,
    badges: ["new"],
    accent: "#38BDF8",
    features: ["LBS/GPS locating", "Two-way calling", "SOS button", "Camera & games"],
    specs: { SIM: "2G/4G", Locating: "GPS/LBS", Battery: "2 days", Water: "IP54" },
    description:
      "A safety-first smartwatch for kids: two-way calling, live location, and an SOS button parents can rely on — plus a camera and games kids love.",
  },
  {
    name: "M9031 Smartwatch",
    tagline: "Flagship · AMOLED calling",
    category: "smartwatches",
    price: 8600,
    rating: 4.7,
    badges: ["limited"],
    features: ["Large AMOLED", "Bluetooth calling", "Full health suite", "Premium straps"],
    specs: { Display: "1.9\" AMOLED", Battery: "10 days", Water: "IP68", Calls: "Bluetooth" },
  },

  /* ── Power Banks ──────────────────────────────────────────── */
  {
    name: "Powerbank Q21",
    tagline: "20,000mAh · fast charge",
    category: "power-banks",
    price: 3000,
    compareAt: 3800,
    rating: 4.7,
    badges: ["bestseller"],
    soldPercent: 69,
    features: ["20,000mAh capacity", "22.5W fast output", "Dual USB + USB-C", "Digital charge display"],
    specs: { Capacity: "20,000mAh", Output: "22.5W", Ports: "USB-A ×2 · USB-C", Input: "USB-C" },
    description:
      "The Q21 packs 20,000mAh with 22.5W fast charging and a clear battery display — enough to top up a phone several times over a long day out.",
  },
  {
    name: "PowerMate 101",
    tagline: "Slim backup battery",
    category: "power-banks",
    price: 500,
    rating: 4.3,
    features: ["Pocket-size", "Reliable backup charge", "USB output", "LED indicator"],
    specs: { Capacity: "5,000mAh", Output: "10W", Ports: "USB-A", Input: "Micro-USB" },
  },
  {
    name: "PowerOmni 251",
    tagline: "Compact · everyday power",
    category: "power-banks",
    price: 1400,
    rating: 4.4,
    features: ["Grab-and-go size", "Fast top-ups", "Dual output", "Safe charging chip"],
    specs: { Capacity: "10,000mAh", Output: "18W", Ports: "USB-A ×2", Input: "USB-C" },
  },

  /* ── Chargers & Adapters ──────────────────────────────────── */
  {
    name: "20W Rapid Charger",
    tagline: "Fast wall adapter",
    category: "chargers",
    price: 1000,
    rating: 4.6,
    features: ["20W PD fast charge", "USB-C output", "Compact plug", "Safe-charge protection"],
    specs: { Output: "20W", Port: "USB-C", Protocol: "PD 3.0", Safety: "Multi-protect" },
  },
  {
    name: "10W Charger",
    tagline: "Everyday wall charger",
    category: "chargers",
    price: 500,
    rating: 4.3,
    features: ["Steady 10W output", "USB-A port", "Compact", "Over-current protection"],
    specs: { Output: "10W", Port: "USB-A", Protocol: "5V/2A", Safety: "Over-current" },
  },
  {
    name: "2A Fast Charger",
    tagline: "Reliable 2A output",
    category: "chargers",
    price: 500,
    rating: 4.3,
    features: ["2A steady charging", "Durable housing", "Universal USB-A", "Safe-charge chip"],
    specs: { Output: "10W", Port: "USB-A", Current: "2A", Safety: "Protected" },
  },
  {
    name: "45W GaN Ultra Fast",
    tagline: "GaN · charges laptops",
    category: "chargers",
    price: 1600,
    compareAt: 2000,
    rating: 4.7,
    badges: ["new"],
    features: ["45W GaN tech", "Charges phones & laptops", "USB-C PD/PPS", "Cool & compact"],
    specs: { Output: "45W", Port: "USB-C", Protocol: "PD · PPS", Tech: "GaN" },
    description:
      "GaN technology packs 45W into a charger small enough for your pocket — fast enough for phones, tablets and many USB-C laptops.",
  },
  {
    name: "18W Car Charger",
    tagline: "Fast charging on the road",
    category: "chargers",
    price: 1500,
    rating: 4.5,
    features: ["18W fast output", "Dual ports", "12/24V vehicles", "LED locator"],
    specs: { Output: "18W", Ports: "USB-A + USB-C", Vehicle: "12/24V", Protocol: "QC/PD" },
  },
  {
    name: "Wireless Charger",
    tagline: "15W magnetic · MagSafe-ready",
    category: "chargers",
    price: 2500,
    rating: 4.6,
    badges: ["new"],
    features: ["15W fast wireless charge", "Strong magnetic alignment", "Case-friendly charging", "Nine-layer safety protection"],
    specs: { Output: "15W", Type: "Magnetic Qi", Compatible: "iPhone · Samsung · Tecno · Infinix", Build: "Alloy & glass" },
    description:
      "The Oraimo PowerDock snaps onto your phone with strong magnets and tops it up at up to 15W — no cable fumbling. A slim alloy-and-glass pad with nine layers of safety protection, and it charges right through most cases.",
  },

  /* ── Cables ───────────────────────────────────────────────── */
  {
    name: "100W Fast Charging Cable",
    tagline: "USB-C to USB-C · 100W",
    category: "cables",
    price: 1200,
    rating: 4.7,
    badges: ["bestseller"],
    features: ["100W power delivery", "Fast data sync", "Braided & durable", "1m length"],
    specs: { Type: "USB-C to USB-C", Power: "100W", Length: "1m", Build: "Braided" },
  },
  {
    name: "Robust Line 2A 1M",
    tagline: "Tough everyday cable",
    category: "cables",
    price: 300,
    rating: 4.4,
    features: ["2A charging", "Reinforced ends", "Tangle-resistant", "1m length"],
    specs: { Current: "2A", Length: "1m", Build: "Reinforced", Connector: "USB-A" },
  },
  {
    name: "Plug Cable",
    tagline: "Priced by type & length",
    category: "cables",
    price: 200,
    rating: 4.2,
    features: ["Multiple connector types", "Cut to the length you need", "Reliable everyday use", "Ask for a quote"],
    specs: { Pricing: "By type & length", Types: "USB-A/C · Lightning · Micro", Length: "Custom" },
    description:
      "Plug cables in a range of connector types and lengths — pricing varies by type and metres. Contact SIR VERT ENTERPRISE for the exact price for what you need.",
  },

  /* ── Home Appliances ──────────────────────────────────────── */
  {
    name: "Powerjet 130",
    tagline: "High-pressure washer",
    category: "home-appliances",
    price: 7200,
    rating: 4.6,
    badges: ["new"],
    features: ["130-bar pressure", "Car & patio cleaning", "Adjustable nozzle", "Long hose & lance"],
    specs: { Pressure: "130 bar", Use: "Car · patio · walls", Nozzle: "Adjustable", Power: "Mains" },
    description:
      "The Powerjet 130 blasts away dirt from cars, driveways and walls with a strong 130-bar jet and an adjustable nozzle for the right spread every time.",
  },
  {
    name: "Smart Iron",
    tagline: "Steam · anti-scale",
    category: "home-appliances",
    price: 5000,
    rating: 4.5,
    features: ["Powerful steam burst", "Ceramic soleplate", "Anti-scale system", "Auto shut-off"],
    specs: { Soleplate: "Ceramic", Steam: "Burst + vertical", Safety: "Auto-off", Power: "2000W" },
  },
  {
    name: "Sonic Power Toothbrush",
    tagline: "Sonic clean · smart timer",
    category: "home-appliances",
    price: 2700,
    rating: 4.6,
    features: ["Sonic vibration clean", "Multiple modes", "2-min smart timer", "Long battery life"],
    specs: { Type: "Sonic", Modes: "Clean · soft · polish", Battery: "30 days", Water: "IPX7" },
  },
  {
    name: "Handheld Fan",
    tagline: "Rechargeable · pocket breeze",
    category: "home-appliances",
    price: 2999,
    rating: 4.4,
    features: ["3 speed levels", "USB-C rechargeable", "Fold-and-stand design", "Quiet motor"],
    specs: { Speeds: "3", Battery: "Rechargeable", Charge: "USB-C", Style: "Foldable" },
  },
  {
    name: "2 in 1 Vacuum",
    tagline: "Cordless · handheld + stick",
    category: "home-appliances",
    price: 7500,
    compareAt: 8900,
    rating: 4.7,
    badges: ["bestseller"],
    soldPercent: 58,
    features: ["Handheld + stick modes", "Strong cyclone suction", "Cordless & rechargeable", "Washable filter"],
    specs: { Modes: "2-in-1", Suction: "High cyclone", Battery: "Cordless", Filter: "Washable" },
    description:
      "Switch from a full-length stick vacuum to a handheld in seconds. Strong cyclone suction, cordless freedom and a washable filter make quick work of the whole house and the car.",
  },
  {
    name: "Hair Dryer",
    tagline: "Fast-dry · ionic care",
    category: "home-appliances",
    price: 6899,
    rating: 4.6,
    features: ["Ionic frizz control", "Multiple heat settings", "Cool-shot button", "Concentrator nozzle"],
    specs: { Power: "1800W", Heat: "Multi-setting", Ionic: "Yes", Nozzle: "Concentrator" },
  },
  {
    name: "Foam Cleaner",
    tagline: "Multi-surface cleaning foam",
    category: "home-appliances",
    price: 350,
    rating: 4.3,
    features: ["Lifts dirt & grime", "Interior & surfaces", "Fresh finish", "Easy spray"],
    specs: { Use: "Multi-surface", Form: "Foam spray", Finish: "Streak-free" },
  },

  /* ── Computer Accessories ─────────────────────────────────── */
  {
    name: "Gaming Keyboard",
    tagline: "Backlit · responsive keys",
    category: "computing",
    price: 4500,
    rating: 4.6,
    badges: ["new"],
    accent: "#A78BFA",
    features: ["RGB backlight", "Anti-ghosting keys", "Durable keycaps", "Plug & play USB"],
    specs: { Backlight: "RGB", Keys: "Anti-ghost", Connection: "USB", Build: "Reinforced" },
  },
  {
    name: "USB Hub",
    tagline: "Expand your ports",
    category: "computing",
    price: 1700,
    rating: 4.5,
    features: ["Multiple USB ports", "Plug & play", "Compact aluminium", "Fast data transfer"],
    specs: { Ports: "4× USB", Speed: "Up to 5Gbps", Build: "Aluminium", Connection: "USB-A/C" },
  },
  {
    name: "Wireless Mouse",
    tagline: "2.4G · silent click",
    category: "computing",
    price: 600,
    rating: 4.4,
    features: ["2.4G wireless", "Silent clicks", "Adjustable DPI", "Long battery life"],
    specs: { Connection: "2.4G USB", DPI: "Adjustable", Clicks: "Silent", Battery: "1× AA" },
  },
  {
    name: "Mini Wireless Keyboard",
    tagline: "Compact · with touchpad",
    category: "computing",
    price: 1200,
    rating: 4.4,
    features: ["Built-in touchpad", "For TV & PC", "Rechargeable", "Pocket-size"],
    specs: { Connection: "2.4G USB", Touchpad: "Yes", Battery: "Rechargeable", Use: "TV · PC" },
  },
  {
    name: "Bluetooth Mouse",
    tagline: "Slim · dual-mode",
    category: "computing",
    price: 500,
    rating: 4.3,
    features: ["Bluetooth connection", "Slim & quiet", "Adjustable DPI", "Energy saving"],
    specs: { Connection: "Bluetooth", DPI: "Adjustable", Clicks: "Quiet", Battery: "1× AA" },
  },
  {
    name: "HP Wired Mouse",
    tagline: "Plug & play reliability",
    category: "computing",
    price: 500,
    rating: 4.4,
    brand: "hp",
    features: ["Reliable wired USB", "Comfort grip", "1000 DPI optical", "No battery needed"],
    specs: { Connection: "USB wired", DPI: "1000", Sensor: "Optical", Brand: "HP" },
  },
  {
    name: "VGA Cable",
    tagline: "Priced by length",
    category: "computing",
    price: 500,
    rating: 4.2,
    features: ["Monitor & projector display", "Available in many lengths", "Shielded connectors", "Ask for a quote"],
    specs: { Type: "VGA to VGA", Pricing: "By length", Length: "Custom", Use: "Monitors · projectors" },
    description:
      "VGA display cables in the length you need — pricing varies by metres. Contact SIR VERT ENTERPRISE for a quote on the exact length.",
  },

  /* ── Cameras & Security ───────────────────────────────────── */
  {
    name: "IP C30 Camera",
    tagline: "WiFi · full-HD security",
    category: "cameras",
    price: 6000,
    rating: 4.6,
    badges: ["new"],
    accent: "#22D3EE",
    features: ["Full-HD video", "Night vision", "Motion alerts to your phone", "Two-way audio"],
    specs: { Resolution: "1080p", Vision: "Night IR", Connection: "WiFi", Audio: "Two-way" },
    description:
      "Keep an eye on home or shop from your phone. The IP C30 streams full-HD day or night, sends motion alerts, and lets you talk back through two-way audio.",
  },
];

export const products: Product[] = raw.map(make);

export const productMap = Object.fromEntries(
  products.map((p) => [p.slug, p]),
) as Record<string, Product>;

export function getProducts(opts?: {
  category?: CategorySlug;
  badge?: Product["badges"][number];
  limit?: number;
  exclude?: string;
}): Product[] {
  let list = products.slice();
  if (opts?.category) list = list.filter((p) => p.category === opts.category);
  if (opts?.badge) list = list.filter((p) => p.badges.includes(opts.badge!));
  if (opts?.exclude) list = list.filter((p) => p.slug !== opts.exclude);
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function getProduct(slug: string): Product | undefined {
  return productMap[slug];
}

export function getRelated(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, limit);
}

export const flashSaleProducts = products.filter((p) => p.compareAt);
export const bestSellers = products.filter((p) => p.badges.includes("bestseller"));
export const newArrivals = products.filter((p) => p.badges.includes("new"));

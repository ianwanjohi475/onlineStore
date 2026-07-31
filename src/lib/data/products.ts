import type { CategorySlug, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Seed = Omit<Product, "id" | "slug" | "reviewCount"> & {
  reviewCount?: number;
};

function make(seed: Seed): Product {
  const slug = slugify(seed.name);
  return {
    id: slug,
    slug,
    reviewCount: seed.reviewCount ?? Math.round(40 + seed.rating * 120),
    ...seed,
  };
}

const raw: Seed[] = [
  // ── Earbuds ───────────────────────────────────────────────
  {
    name: "FreePods 4 Pro",
    tagline: "Adaptive ANC · 48h playtime",
    category: "earbuds",
    price: 6499,
    compareAt: 8999,
    rating: 4.8,
    accent: "#00E676",
    colors: ["#0B3D2E", "#F5F5F5", "#00E676"],
    badges: ["bestseller", "sale"],
    features: ["Adaptive noise cancellation", "13mm titanium drivers", "48h with case", "Wireless charging"],
    specs: { Driver: "13mm titanium", ANC: "Adaptive up to 42dB", Battery: "9h + 39h case", Bluetooth: "5.4", Waterproof: "IPX5" },
    inStock: true,
    soldPercent: 82,
    description:
      "The FreePods 4 Pro pair studio-grade titanium drivers with adaptive noise cancellation that reads your surroundings in real time. A featherweight shell disappears in the ear while 48 hours of total playtime keeps the music going all week.",
  },
  {
    name: "FreePods Lite",
    tagline: "All-day comfort · 30h playtime",
    category: "earbuds",
    price: 2999,
    rating: 4.6,
    accent: "#4ADE80",
    colors: ["#F5F5F5", "#0B3D2E"],
    badges: ["bestseller"],
    features: ["ENC call clarity", "30h playtime", "Low-latency game mode", "Touch controls"],
    specs: { Driver: "10mm dynamic", ANC: "ENC (calls)", Battery: "6h + 24h case", Bluetooth: "5.3", Waterproof: "IPX4" },
    inStock: true,
    soldPercent: 67,
    description:
      "A daily-driver bud tuned for balance and comfort. Environmental noise cancellation keeps your calls crisp, and a low-latency game mode locks audio to the action.",
  },
  {
    name: "OpenRing Air",
    tagline: "Open-ear · aware of the world",
    category: "earbuds",
    price: 5499,
    compareAt: 6999,
    rating: 4.7,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["new", "sale"],
    features: ["Open-ear air conduction", "Secure sport hook", "Stay aware outdoors", "16h playtime"],
    specs: { Type: "Open-ear", Driver: "16.2mm", Battery: "6h + 10h case", Bluetooth: "5.3", Waterproof: "IPX7" },
    inStock: true,
    soldPercent: 41,
    description:
      "OpenRing Air rests just outside the ear canal, so you hear your playlist and the road at the same time. A sweat-proof hook keeps them locked in through every run.",
  },
  // ── Smartwatches ──────────────────────────────────────────
  {
    name: "Watch Meta Ultra",
    tagline: "AMOLED · AI health coach",
    category: "smartwatches",
    price: 8999,
    compareAt: 11999,
    rating: 4.9,
    accent: "#34F5C5",
    colors: ["#0A2540", "#F5F5F5", "#00E676"],
    badges: ["bestseller", "sale", "limited"],
    features: ["1.5\" AMOLED always-on", "Bluetooth calling", "SpO2 + heart-rate AI", "14-day battery"],
    specs: { Display: "1.5\" AMOLED", Battery: "14 days", Calls: "Bluetooth", Sensors: "HR · SpO2 · SpO2", Waterproof: "IP68" },
    inStock: true,
    soldPercent: 91,
    description:
      "A flagship-class wearable with a razor-sharp AMOLED display, on-wrist calling, and an AI coach that turns your vitals into daily guidance — all on a two-week battery.",
  },
  {
    name: "Watch Fit 2",
    tagline: "100+ sport modes",
    category: "smartwatches",
    price: 4499,
    rating: 4.5,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676", "#F5F5F5"],
    badges: ["new"],
    features: ["100+ workout modes", "Sleep score", "10-day battery", "Slim aluminium body"],
    specs: { Display: "1.75\" TFT", Battery: "10 days", Modes: "100+", Sensors: "HR · Sleep", Waterproof: "IP68" },
    inStock: true,
    soldPercent: 38,
    description:
      "A lightweight tracker that keeps up with every discipline — from HIIT to open water — and scores your sleep so tomorrow starts stronger.",
  },
  // ── Power banks ───────────────────────────────────────────
  {
    name: "PowerCore 27000",
    tagline: "65W · charges a laptop",
    category: "power-banks",
    price: 5999,
    compareAt: 7499,
    rating: 4.8,
    accent: "#7CFF6B",
    colors: ["#123524", "#1A1A1A"],
    badges: ["bestseller", "sale"],
    features: ["27000mAh capacity", "65W USB-C PD", "Charges laptops", "Digital charge display"],
    specs: { Capacity: "27000mAh", Output: "65W USB-C PD", Ports: "2×USB-C · 1×USB-A", Display: "Digital %", Input: "65W" },
    inStock: true,
    soldPercent: 74,
    description:
      "Enough reserve to refuel a phone six times or top up an ultrabook. A crisp digital readout shows exactly how much runway you have left.",
  },
  {
    name: "PowerSlim 10000",
    tagline: "Pocket-thin · 22.5W",
    category: "power-banks",
    price: 2499,
    rating: 4.6,
    accent: "#4ADE80",
    colors: ["#F5F5F5", "#0B3D2E", "#00E676"],
    badges: ["bestseller"],
    features: ["10000mAh in 11mm", "22.5W fast charge", "Built-in cable", "Trifold safety"],
    specs: { Capacity: "10000mAh", Output: "22.5W", Thickness: "11mm", Ports: "USB-C · USB-A", Cable: "Built-in" },
    inStock: true,
    soldPercent: 59,
    description:
      "The power bank you forget is in your bag — until you need it. Card-slim, with a built-in cable so you're never caught short.",
  },
  // ── Chargers ──────────────────────────────────────────────
  {
    name: "GaN Cube 67W",
    tagline: "3 ports · tiny footprint",
    category: "chargers",
    price: 3299,
    compareAt: 3999,
    rating: 4.7,
    accent: "#00E676",
    colors: ["#F5F5F5", "#1A1A1A"],
    badges: ["new", "sale"],
    features: ["67W GaN III", "2×USB-C + USB-A", "Foldable pins", "Charges 3 devices"],
    specs: { Output: "67W total", Tech: "GaN III", Ports: "2×USB-C · 1×USB-A", Pins: "Foldable", Safety: "Multi-protect" },
    inStock: true,
    soldPercent: 46,
    description:
      "GaN III silicon shrinks a 67W three-port charger to the size of a walnut. Power a laptop, a phone and buds from a single wall socket.",
  },
  {
    name: "MagPad Wireless",
    tagline: "15W magnetic · qi2",
    category: "chargers",
    price: 2799,
    rating: 4.4,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["new"],
    features: ["15W Qi2 magnetic", "Snap-align magnets", "Case-friendly", "LED status ring"],
    specs: { Output: "15W", Standard: "Qi2", Alignment: "Magnetic", Indicator: "LED ring", Input: "USB-C" },
    inStock: true,
    soldPercent: 29,
    description:
      "Snap your phone to the pad and it aligns itself for the fastest possible wireless charge — no fiddling, no cables.",
  },
  // ── Cables ────────────────────────────────────────────────
  {
    name: "UltraBraid USB-C 100W",
    tagline: "Nylon armour · 20,000 bends",
    category: "cables",
    price: 899,
    compareAt: 1299,
    rating: 4.8,
    accent: "#4ADE80",
    colors: ["#0B3D2E", "#F5F5F5"],
    badges: ["bestseller", "sale"],
    features: ["100W power delivery", "480Mbps data", "Rated 20,000 bends", "2m length"],
    specs: { Power: "100W PD", Data: "480Mbps", Length: "2m", Durability: "20,000 bends", Jacket: "Braided nylon" },
    inStock: true,
    soldPercent: 88,
    description:
      "A cable engineered to outlast the phone it charges. Aircraft-grade nylon braiding survives twenty thousand bends without a flinch.",
  },
  {
    name: "LightningFlow 3-in-1",
    tagline: "USB-C · Lightning · micro",
    category: "cables",
    price: 1199,
    rating: 4.5,
    accent: "#00E676",
    colors: ["#1A1A1A", "#00E676", "#F5F5F5"],
    badges: [],
    features: ["Three tips in one", "60W charging", "Tangle-free", "1.2m"],
    specs: { Tips: "USB-C · Lightning · Micro", Power: "60W", Length: "1.2m", Jacket: "TPE", Data: "480Mbps" },
    inStock: true,
    soldPercent: 33,
    description:
      "One cable for every device in the house. Three tips fold neatly together so nothing tangles in your bag.",
  },
  // ── Speakers ──────────────────────────────────────────────
  {
    name: "SoundGo Boom",
    tagline: "40W · 24h · IPX7",
    category: "speakers",
    price: 6999,
    compareAt: 8499,
    rating: 4.7,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["bestseller", "sale"],
    features: ["40W stereo", "Deep bass radiators", "24h battery", "IPX7 waterproof"],
    specs: { Power: "40W", Battery: "24h", Waterproof: "IPX7", Pairing: "TWS stereo", Bluetooth: "5.3" },
    inStock: true,
    soldPercent: 63,
    description:
      "Twin passive radiators throw room-filling bass, and an IPX7 shell shrugs off the pool party. Pair two for true wireless stereo.",
  },
  {
    name: "SoundGo Mini",
    tagline: "Pocket speaker · 12h",
    category: "speakers",
    price: 2299,
    rating: 4.4,
    accent: "#6EE7B7",
    colors: ["#00E676", "#1A1A1A", "#F5F5F5"],
    badges: ["new"],
    features: ["Palm-sized", "12h battery", "Clip-on strap", "IPX6"],
    specs: { Power: "8W", Battery: "12h", Waterproof: "IPX6", Strap: "Carabiner", Bluetooth: "5.3" },
    inStock: false,
    soldPercent: 22,
    description:
      "Clip it to a backpack and take the soundtrack anywhere. Surprisingly big sound from a speaker that fits in your palm.",
  },
  // ── Accessories ───────────────────────────────────────────
  {
    name: "Halo Ring Light",
    tagline: "Clip-on · 3 tones",
    category: "accessories",
    price: 1499,
    compareAt: 1999,
    rating: 4.3,
    accent: "#6EE7B7",
    colors: ["#F5F5F5", "#1A1A1A"],
    badges: ["sale"],
    features: ["3 colour temperatures", "10 brightness levels", "Clip-on", "Rechargeable"],
    specs: { Tones: "3", Levels: "10", Mount: "Universal clip", Battery: "Rechargeable", Input: "USB-C" },
    inStock: true,
    soldPercent: 35,
    description:
      "A soft, even key light that clips to any laptop or phone — three tones and ten levels for calls that always look considered.",
  },
  {
    name: "FlexStand Pro",
    tagline: "Aluminium · adjustable",
    category: "accessories",
    price: 1799,
    rating: 4.6,
    accent: "#4ADE80",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["new"],
    features: ["Aircraft aluminium", "Multi-angle hinge", "Cable channel", "Non-slip pads"],
    specs: { Material: "Aluminium", Angles: "Multi", Devices: "Phone · Tablet", Grip: "Silicone", Fold: "Flat" },
    inStock: true,
    soldPercent: 48,
    description:
      "A machined aluminium stand that folds flat and props your phone or tablet at exactly the right angle for work or watching.",
  },
  // ── More earbuds ──────────────────────────────────────────
  {
    name: "FreePods Studio",
    tagline: "Hi-res LDAC · spatial audio",
    category: "earbuds",
    price: 7999,
    compareAt: 9999,
    rating: 4.9,
    accent: "#00E676",
    colors: ["#0B3D2E", "#F5F5F5"],
    badges: ["new", "sale"],
    features: ["LDAC hi-res audio", "Head-tracking spatial sound", "50h playtime", "Multipoint pairing"],
    specs: { Driver: "11mm + planar", Codec: "LDAC · AAC", Battery: "10h + 40h", Bluetooth: "5.4", Waterproof: "IPX4" },
    inStock: true,
    soldPercent: 55,
    description: "A reference-grade set for people who actually hear the difference — hi-res LDAC, head-tracked spatial audio, and multipoint that hops between your laptop and phone without missing a beat.",
  },
  {
    name: "SportBuds Active",
    tagline: "Sweatproof · secure fit",
    category: "earbuds",
    price: 3499,
    rating: 4.5,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676", "#F5F5F5"],
    badges: [],
    features: ["Ear-hook lock", "IPX7 sweatproof", "28h playtime", "Ambient sport mode"],
    specs: { Driver: "10mm", Fit: "Ear-hook", Battery: "7h + 21h", Bluetooth: "5.3", Waterproof: "IPX7" },
    inStock: true,
    soldPercent: 44,
    description: "Locked-in buds built for the gym and the road — a secure hook, sweatproof shell, and an ambient mode so you can hear traffic on your run.",
  },
  // ── More smartwatches ─────────────────────────────────────
  {
    name: "Watch Meta Lite",
    tagline: "Slim AMOLED · 12-day battery",
    category: "smartwatches",
    price: 5999,
    compareAt: 7499,
    rating: 4.6,
    accent: "#34F5C5",
    colors: ["#0A2540", "#F5F5F5", "#00E676"],
    badges: ["sale"],
    features: ["1.3\" AMOLED", "12-day battery", "SpO2 + sleep", "5ATM swim-proof"],
    specs: { Display: "1.3\" AMOLED", Battery: "12 days", Sensors: "HR · SpO2", Water: "5ATM", Weight: "32g" },
    inStock: true,
    soldPercent: 51,
    description: "All the essentials in a slimmer, lighter case — a bright AMOLED panel, swim-proof to 5ATM, and nearly two weeks between charges.",
  },
  {
    name: "Watch Kids GPS",
    tagline: "GPS · SOS · parent app",
    category: "smartwatches",
    price: 4999,
    rating: 4.4,
    accent: "#00E676",
    colors: ["#00E676", "#34F5C5", "#F5F5F5"],
    badges: ["new"],
    features: ["Live GPS location", "Two-way calling", "SOS button", "Class mode"],
    specs: { Display: "1.4\" IPS", GPS: "Live tracking", Calls: "4G", Battery: "3 days", Water: "IP67" },
    inStock: true,
    soldPercent: 30,
    description: "Peace of mind on their wrist — live GPS, two-way calls to approved contacts, an SOS button, and a class mode that silences it during school.",
  },
  // ── More power ────────────────────────────────────────────
  {
    name: "PowerCore 10K MagGo",
    tagline: "Magnetic · wireless · slim",
    category: "power-banks",
    price: 3999,
    compareAt: 4999,
    rating: 4.6,
    accent: "#7CFF6B",
    colors: ["#123524", "#F5F5F5"],
    badges: ["new", "sale"],
    features: ["Snap-on magnetic charging", "10000mAh", "Fold-out kickstand", "20W USB-C"],
    specs: { Capacity: "10000mAh", Wireless: "15W magnetic", Wired: "20W USB-C", Stand: "Built-in", Weight: "215g" },
    inStock: true,
    soldPercent: 47,
    description: "Snaps to the back of your phone and charges wirelessly while a fold-out stand props it up for hands-free video. Slim enough to stay attached all day.",
  },
  {
    name: "SolarCharge 20000",
    tagline: "Solar top-up · rugged",
    category: "power-banks",
    price: 4499,
    rating: 4.3,
    accent: "#4ADE80",
    colors: ["#1A1A1A", "#00E676"],
    badges: [],
    features: ["Solar panel top-up", "20000mAh", "IP66 dust & splash", "Dual USB output"],
    specs: { Capacity: "20000mAh", Solar: "Emergency top-up", Rugged: "IP66", Ports: "2×USB-A · USB-C", Torch: "Built-in" },
    inStock: true,
    soldPercent: 26,
    description: "Built for the outdoors — a rugged, splash-proof shell, a solar panel for emergency top-ups off-grid, and a built-in torch for the tent.",
  },
  // ── More chargers ─────────────────────────────────────────
  {
    name: "GaN Tower 100W",
    tagline: "4 ports · desktop hub",
    category: "chargers",
    price: 4299,
    compareAt: 5299,
    rating: 4.7,
    accent: "#00E676",
    colors: ["#1A1A1A", "#F5F5F5"],
    badges: ["bestseller", "sale"],
    features: ["100W total output", "3×USB-C + USB-A", "Charges a laptop + 3 devices", "Desktop footprint"],
    specs: { Output: "100W", Tech: "GaN III", Ports: "3×USB-C · 1×USB-A", Form: "Upright tower", Safety: "Multi-protect" },
    inStock: true,
    soldPercent: 58,
    description: "One upright hub that clears your desk of bricks — 100 watts across four ports, enough to run a laptop and three devices at full speed.",
  },
  {
    name: "CarCharge 45W",
    tagline: "Dual-port · metal",
    category: "chargers",
    price: 1299,
    rating: 4.5,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676"],
    badges: [],
    features: ["45W USB-C PD", "Dual port", "Aluminium body", "Ambient light ring"],
    specs: { Output: "45W total", Ports: "USB-C · USB-A", Body: "Aluminium", Light: "Ambient ring", Fit: "12V socket" },
    inStock: true,
    soldPercent: 34,
    description: "A machined-metal car charger that fast-charges two devices at once, with a soft ambient ring so you can find the port at night.",
  },
  // ── More cables ───────────────────────────────────────────
  {
    name: "UltraBraid Lightning 27W",
    tagline: "MFi · nylon armour",
    category: "cables",
    price: 999,
    rating: 4.6,
    accent: "#4ADE80",
    colors: ["#0B3D2E", "#F5F5F5"],
    badges: [],
    features: ["MFi certified", "27W fast charge", "Braided nylon", "1.5m"],
    specs: { Tip: "USB-C to Lightning", Power: "27W", Length: "1.5m", Cert: "MFi", Jacket: "Braided nylon" },
    inStock: true,
    soldPercent: 40,
    description: "An MFi-certified braided cable that fast-charges iPhones safely and survives being yanked out of the wall a thousand times over.",
  },
  {
    name: "DataLink USB-C 240W",
    tagline: "240W · 40Gbps · 4K",
    category: "cables",
    price: 1799,
    compareAt: 2299,
    rating: 4.8,
    accent: "#00E676",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["new", "sale"],
    features: ["240W USB-C PD 3.1", "40Gbps data", "4K/8K video out", "E-marker chip"],
    specs: { Power: "240W", Data: "40Gbps", Video: "8K@60", Length: "1m", Chip: "E-marker" },
    inStock: true,
    soldPercent: 36,
    description: "A do-everything USB-C cable — power a gaming laptop, move 40Gbps of data, and drive an 8K display, all down one wire.",
  },
  // ── More speakers ─────────────────────────────────────────
  {
    name: "SoundGo Party 80W",
    tagline: "80W · lights · karaoke",
    category: "speakers",
    price: 12999,
    compareAt: 15999,
    rating: 4.7,
    accent: "#22F58C",
    colors: ["#1A1A1A", "#00E676"],
    badges: ["bestseller", "sale", "limited"],
    features: ["80W stereo", "Reactive light show", "Mic + guitar in", "16h battery"],
    specs: { Power: "80W", Battery: "16h", Lights: "Reactive RGB", Inputs: "Mic · Guitar · AUX", Water: "IPX5" },
    inStock: true,
    soldPercent: 62,
    description: "The one that turns a room into a party — 80 watts of stereo, a reactive light show, and mic and guitar inputs for impromptu karaoke.",
  },
  {
    name: "SoundBar Cinema",
    tagline: "2.1 · deep bass · TV",
    category: "speakers",
    price: 9999,
    rating: 4.5,
    accent: "#6EE7B7",
    colors: ["#1A1A1A", "#0B3D2E"],
    badges: ["new"],
    features: ["2.1 channel", "Wireless subwoofer", "HDMI ARC", "Movie/music/game modes"],
    specs: { Channels: "2.1", Sub: "Wireless", Inputs: "HDMI ARC · Optical · BT", Modes: "3", Power: "120W" },
    inStock: true,
    soldPercent: 33,
    description: "Give the TV the sound it deserves — a punchy 2.1 bar with a wireless subwoofer, one-cable HDMI ARC, and tuned modes for film, music and games.",
  },
  // ── More accessories ──────────────────────────────────────
  {
    name: "AirTag Locator",
    tagline: "Find keys, bags, anything",
    category: "accessories",
    price: 1299,
    rating: 4.4,
    accent: "#4ADE80",
    colors: ["#F5F5F5", "#1A1A1A"],
    badges: ["new"],
    features: ["Bluetooth finder", "1-year battery", "Ring to find", "Community locate"],
    specs: { Range: "Up to 120m", Battery: "1 year", Alert: "Ring + app", Water: "IP67", Mount: "Keyring" },
    inStock: true,
    soldPercent: 29,
    description: "Never hunt for your keys again — clip on the locator, ring it from your phone, or lean on the community network when it's further afield.",
  },
  {
    name: "GripCase Clear",
    tagline: "Drop-proof · MagSafe",
    category: "accessories",
    price: 1499,
    rating: 4.6,
    accent: "#22F58C",
    colors: ["#F5F5F5", "#00E676", "#1A1A1A"],
    badges: [],
    features: ["Magnetic ring", "2m drop protection", "Anti-yellow clear", "Raised camera lip"],
    specs: { Magnet: "MagSafe-compatible", Drop: "2m rated", Material: "Anti-yellow TPU", Edges: "Raised", Fit: "Precise cutouts" },
    inStock: true,
    soldPercent: 42,
    description: "A crystal-clear case that stays clear — magnetic for wireless charging, rated for two-metre drops, with a raised lip that keeps your camera off the table.",
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

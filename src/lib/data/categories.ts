import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "earbuds",
    name: "Earbuds",
    tagline: "Immersive wireless sound",
    icon: "Headphones",
    gradient: ["#00E676", "#0B3D2E"],
  },
  {
    slug: "smartwatches",
    name: "Smartwatches",
    tagline: "Track every heartbeat",
    icon: "Watch",
    gradient: ["#34F5C5", "#0A2540"],
  },
  {
    slug: "power-banks",
    name: "Power Banks",
    tagline: "Charge that outlasts the day",
    icon: "BatteryCharging",
    gradient: ["#7CFF6B", "#123524"],
  },
  {
    slug: "chargers",
    name: "Chargers",
    tagline: "Fast, safe, everywhere",
    icon: "Zap",
    gradient: ["#00E676", "#1A1A1A"],
  },
  {
    slug: "cables",
    name: "Cables",
    tagline: "Built to never fray",
    icon: "Cable",
    gradient: ["#4ADE80", "#0B3D2E"],
  },
  {
    slug: "speakers",
    name: "Speakers",
    tagline: "Room-filling bass",
    icon: "Speaker",
    gradient: ["#22F58C", "#0A2540"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "Finish the setup",
    icon: "Sparkles",
    gradient: ["#6EE7B7", "#123524"],
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tagline: "Fresh off the line",
    icon: "Rocket",
    gradient: ["#00E676", "#052E1C"],
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<Category["slug"], Category>;

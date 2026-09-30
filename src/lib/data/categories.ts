import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "earbuds",
    name: "Earbuds & Audio",
    tagline: "Immersive wireless sound",
    icon: "Headphones",
    gradient: ["#3B82F6", "#131A2A"],
  },
  {
    slug: "smartwatches",
    name: "Smartwatches",
    tagline: "Track every heartbeat",
    icon: "Watch",
    gradient: ["#F59E0B", "#131A2A"],
  },
  {
    slug: "power-banks",
    name: "Power Banks",
    tagline: "Charge that outlasts the day",
    icon: "BatteryCharging",
    gradient: ["#06B6D4", "#0E2347"],
  },
  {
    slug: "chargers",
    name: "Chargers & Adapters",
    tagline: "Fast, safe, everywhere",
    icon: "Zap",
    gradient: ["#F97316", "#1C2538"],
  },
  {
    slug: "cables",
    name: "Cables",
    tagline: "Built to never fray",
    icon: "Cable",
    gradient: ["#8B5CF6", "#131A2A"],
  },
  {
    slug: "speakers",
    name: "Speakers & Headphones",
    tagline: "Room-filling bass",
    icon: "Speaker",
    gradient: ["#0EA5E9", "#131A2A"],
  },
  {
    slug: "home-appliances",
    name: "Home Appliances",
    tagline: "Smarter everyday living",
    icon: "Home",
    gradient: ["#38BDF8", "#0A2540"],
  },
  {
    slug: "computing",
    name: "Computer Accessories",
    tagline: "Gear up your desk",
    icon: "Monitor",
    gradient: ["#A78BFA", "#1A1A1A"],
  },
  {
    slug: "cameras",
    name: "Cameras & Security",
    tagline: "Watch what matters",
    icon: "Camera",
    gradient: ["#22D3EE", "#131A2A"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "Finish the setup",
    icon: "Sparkles",
    gradient: ["#EC4899", "#1C2538"],
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tagline: "Fresh off the line",
    icon: "Rocket",
    gradient: ["#FFB703", "#131A2A"],
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<Category["slug"], Category>;

export type CategorySlug =
  | "earbuds"
  | "smartwatches"
  | "power-banks"
  | "chargers"
  | "cables"
  | "speakers"
  | "accessories"
  | "new-arrivals";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  /** lucide icon name used by the CategoryGrid */
  icon: string;
  /** two-stop gradient (from → to) used for artwork */
  gradient: [string, string];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  price: number;
  /** original price when the item is discounted */
  compareAt?: number;
  rating: number;
  reviewCount: number;
  /** hex accent used to tint the generated product artwork */
  accent: string;
  colors: string[];
  badges: ("new" | "bestseller" | "sale" | "limited")[];
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  /** used to seed flash-sale and best-seller ordering */
  soldPercent?: number;
  description: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
  color?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  quote: string;
  accent: string;
  avatar: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  date: string;
  accent: [string, string];
  image: string;
  author: string;
  body: string[];
}

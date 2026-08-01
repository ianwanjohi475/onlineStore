export type CategorySlug =
  | "earbuds"
  | "smartwatches"
  | "power-banks"
  | "chargers"
  | "cables"
  | "speakers"
  | "home-appliances"
  | "computing"
  | "cameras"
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
  stock?: number;
  brand?: string;
  /** used to seed flash-sale and best-seller ordering */
  soldPercent?: number;
  description: string;
  /** product photo URL or /path; falls back to a generated render when empty */
  image?: string | null;
}

export interface HeroSlide {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  copy: string;
  buttonText: string;
  buttonLink: string;
  from: string;
  to: string;
  overlay: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Brand {
  slug: string;
  name: string;
  color: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially-refunded";

/** A single entry in an order's audit trail. */
export interface OrderEvent {
  at: string;
  label: string;
  by?: string;
}

/** An internal admin note attached to an order. */
export interface OrderNote {
  at: string;
  text: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  /** payment method label — M-Pesa, Card, Bank Transfer, Cash on Delivery, PayPal */
  payment: string;
  /** payment reference / transaction id */
  transactionId?: string;
  /** amount refunded so far (for partial refunds) */
  refunded?: number;
  customer: Customer;
  /** separate billing address when it differs from shipping */
  billing?: Customer;
  timeline: OrderEvent[];
  notes: OrderNote[];
  archived?: boolean;
}

export interface Announcement {
  text: string;
  href: string;
  cta: string;
}

export interface PromoCode {
  code: string;
  kind: "percent" | "ship";
  value?: number;
  label: string;
}

export interface SiteSettings {
  brandName: string;
  heroTagline: string;
  announcements: Announcement[];
  heroSlides: HeroSlide[];
  freeShipThreshold: number;
  shippingFee: number;
  whatsapp: string;
  promos: PromoCode[];
  seoTitle: string;
  seoDescription: string;
  supportEmail: string;
  address: string;
  footerBlurb: string;
  socials: { label: string; href: string }[];
}

export interface StoreData {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  testimonials: Testimonial[];
  orders: Order[];
  settings: SiteSettings;
  /** emails of customers whose accounts have been suspended */
  suspendedCustomers?: string[];
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

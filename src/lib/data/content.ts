import type { BlogPost, Testimonial } from "@/lib/types";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    author: "Amina Yusuf",
    role: "Verified buyer · Nairobi",
    rating: 5,
    quote:
      "The FreePods 4 Pro genuinely rival buds twice the price. The noise cancelling on my matatu commute is unreal, and they lasted a full week before a recharge.",
    accent: "#00E676",
  },
  {
    id: "t2",
    author: "Brian Otieno",
    role: "Verified buyer · Kisumu",
    rating: 5,
    quote:
      "Ordered a Watch Meta Ultra on flash sale and it arrived next day. The AMOLED screen is stunning and the battery really does go two weeks.",
    accent: "#34F5C5",
  },
  {
    id: "t3",
    author: "Grace Wambui",
    role: "Verified buyer · Nakuru",
    rating: 4,
    quote:
      "I've bought three cables and a power bank now. Everything just feels built to last — the braided cables haven't frayed at all after months of daily use.",
    accent: "#7CFF6B",
  },
  {
    id: "t4",
    author: "Daniel Mwangi",
    role: "Verified buyer · Mombasa",
    rating: 5,
    quote:
      "Customer support answered on WhatsApp within minutes and sorted my warranty claim the same day. That's why I keep coming back.",
    accent: "#22F58C",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "anc-explained",
    title: "Active noise cancellation, explained without the jargon",
    excerpt:
      "How adaptive ANC actually reads a room — and why it matters more than the number on the box.",
    category: "Buying guide",
    readMinutes: 5,
    date: "2026-07-18",
    accent: ["#00E676", "#0B3D2E"],
  },
  {
    slug: "power-bank-capacity",
    title: "How big a power bank do you really need?",
    excerpt:
      "A simple way to translate mAh into real phone charges, so you buy once and buy right.",
    category: "How-to",
    readMinutes: 4,
    date: "2026-07-11",
    accent: ["#7CFF6B", "#123524"],
  },
  {
    slug: "smartwatch-health",
    title: "Reading your smartwatch health data like a coach",
    excerpt:
      "SpO2, HRV, sleep score — what to watch, what to ignore, and how to turn it into progress.",
    category: "Wellness",
    readMinutes: 6,
    date: "2026-07-02",
    accent: ["#34F5C5", "#0A2540"],
  },
];

export const faqs = [
  {
    q: "How fast is delivery?",
    a: "Orders placed before 3pm ship the same day. Nairobi deliveries arrive next day; the rest of Kenya within 2–4 working days. You'll get an SMS with live tracking the moment your parcel leaves our warehouse.",
  },
  {
    q: "What warranty do Oraimo products carry?",
    a: "Every product is covered by a 12-month manufacturer warranty, and audio and wearables include a 15-day no-questions replacement window. Warranty claims are handled in-app or over WhatsApp.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept M-Pesa, all major debit and credit cards, and pay-on-delivery within Nairobi. Checkout is fully encrypted end to end.",
  },
  {
    q: "Can I return an item if I change my mind?",
    a: "Yes. Unopened items can be returned within 15 days for a full refund. If a product is faulty, we cover return shipping and send a replacement straight away.",
  },
  {
    q: "Are these genuine Oraimo products?",
    a: "Always. We are an authorised channel, so every item is 100% genuine and warranty-backed, with a scratch-to-verify authenticity seal on the box.",
  },
];

export const brandStats = [
  { label: "Products sold", value: 2400000, suffix: "+" },
  { label: "5-star reviews", value: 180000, suffix: "+" },
  { label: "Cities delivered", value: 47, suffix: "" },
  { label: "Avg. rating", value: 4.8, suffix: "★", decimal: true },
];

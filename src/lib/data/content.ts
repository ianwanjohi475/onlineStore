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
    avatar: "/people/a2.jpg",
  },
  {
    id: "t2",
    author: "Brian Otieno",
    role: "Verified buyer · Kisumu",
    rating: 5,
    quote:
      "Ordered a Watch Meta Ultra on flash sale and it arrived next day. The AMOLED screen is stunning and the battery really does go two weeks.",
    accent: "#34F5C5",
    avatar: "/people/a3.jpg",
  },
  {
    id: "t3",
    author: "Grace Wambui",
    role: "Verified buyer · Nakuru",
    rating: 4,
    quote:
      "I've bought three cables and a power bank now. Everything just feels built to last — the braided cables haven't frayed at all after months of daily use.",
    accent: "#7CFF6B",
    avatar: "/people/a5.jpg",
  },
  {
    id: "t4",
    author: "Daniel Mwangi",
    role: "Verified buyer · Mombasa",
    rating: 5,
    quote:
      "Customer support answered on WhatsApp within minutes and sorted my warranty claim the same day. That's why I keep coming back.",
    accent: "#22F58C",
    avatar: "/people/a6.jpg",
  },
];

const body = (topic: string) => [
  `There's a lot of noise around ${topic}, and most of it is marketing. This guide cuts through it with the handful of things that actually change your day-to-day experience — no spec-sheet worship, just what matters when you're using the product.`,
  "Start with how you'll actually use it. The best choice for a daily commuter is rarely the best choice for a marathon trainer or a home-office setup. Match the product to the job and the rest gets simple.",
  "Next, weigh the trade-offs honestly. Bigger batteries mean more weight; louder speakers mean less portability; more features mean more to learn. Premium isn't about maxing every number — it's about the right balance for you.",
  "Finally, buy from somewhere that backs the product. A genuine item with a real warranty and responsive support will always beat a slightly cheaper grey-market gamble. That peace of mind is part of the value.",
  "If you're still unsure, our team is a WhatsApp message away and happy to make a specific recommendation for your situation — no upsell, just the right fit.",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "anc-explained",
    title: "Active noise cancellation, explained without the jargon",
    excerpt: "How adaptive ANC actually reads a room — and why it matters more than the number on the box.",
    category: "Buying guide",
    readMinutes: 5,
    date: "2026-07-18",
    accent: ["#00E676", "#0B3D2E"],
    image: "/editorial/e1.jpg",
    author: "Njeri Kamau",
    body: body("noise cancellation"),
  },
  {
    slug: "power-bank-capacity",
    title: "How big a power bank do you really need?",
    excerpt: "A simple way to translate mAh into real phone charges, so you buy once and buy right.",
    category: "How-to",
    readMinutes: 4,
    date: "2026-07-11",
    accent: ["#7CFF6B", "#123524"],
    image: "/editorial/e2.jpg",
    author: "Brian Otieno",
    body: body("power banks"),
  },
  {
    slug: "smartwatch-health",
    title: "Reading your smartwatch health data like a coach",
    excerpt: "SpO2, HRV, sleep score — what to watch, what to ignore, and how to turn it into progress.",
    category: "Wellness",
    readMinutes: 6,
    date: "2026-07-02",
    accent: ["#34F5C5", "#0A2540"],
    image: "/editorial/e3.jpg",
    author: "Dr. Amina Yusuf",
    body: body("wearable health tracking"),
  },
  {
    slug: "earbuds-fit-guide",
    title: "The fit guide: why your earbuds keep falling out",
    excerpt: "Tip sizes, ear-hooks and open-ear designs — how to finally get a fit that stays put.",
    category: "Buying guide",
    readMinutes: 4,
    date: "2026-06-24",
    accent: ["#22F58C", "#052E1C"],
    image: "/editorial/e1.jpg",
    author: "Kevin Mwangi",
    body: body("earbud fit"),
  },
  {
    slug: "fast-charging-safe",
    title: "Is fast charging bad for your battery? The honest answer",
    excerpt: "What 65W really does to your phone's cells, and the habits that actually extend battery life.",
    category: "Explainer",
    readMinutes: 5,
    date: "2026-06-15",
    accent: ["#00E676", "#123524"],
    image: "/editorial/e2.jpg",
    author: "Grace Wambui",
    body: body("fast charging"),
  },
  {
    slug: "party-speaker-setup",
    title: "Setting up the perfect outdoor party sound",
    excerpt: "Pairing speakers, placing them right, and squeezing every hour out of the battery.",
    category: "How-to",
    readMinutes: 6,
    date: "2026-06-03",
    accent: ["#34F5C5", "#0A2540"],
    image: "/editorial/e3.jpg",
    author: "Daniel Mwangi",
    body: body("outdoor speakers"),
  },
];

export const blogMap = Object.fromEntries(blogPosts.map((p) => [p.slug, p]));

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

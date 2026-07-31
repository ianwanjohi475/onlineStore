import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  CreditCard,
  Headset,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CtaBanner } from "@/components/home/cta-banner";

export const metadata: Metadata = {
  title: "Services",
  description:
    "More than a shop — fast delivery, genuine warranty and repairs, trade-in, business supply, financing and expert setup support for every Oraimo product.",
};

const services = [
  { icon: Truck, title: "Fast, tracked delivery", text: "Same-day dispatch before 3pm. Next-day in Nairobi, 2–4 days countrywide, with live SMS tracking.", tag: "Every order" },
  { icon: ShieldCheck, title: "Warranty & repairs", text: "A 12-month manufacturer warranty on everything, handled in-app or on WhatsApp — most claims resolved same day.", tag: "12 months" },
  { icon: RefreshCw, title: "Trade-in & upgrade", text: "Send us your old buds, watch or power bank and get store credit toward the latest model.", tag: "Get credit" },
  { icon: Boxes, title: "Business & bulk supply", text: "Kitting out a team or reselling? Volume pricing, invoicing and dedicated account support.", tag: "For teams" },
  { icon: CreditCard, title: "Flexible payment", text: "M-Pesa, cards, and pay-on-delivery in Nairobi. Split larger orders into instalments at checkout.", tag: "Buy now, pay later" },
  { icon: Headset, title: "Expert setup help", text: "Pairing, firmware, or choosing the right fit — our team walks you through it over WhatsApp or call.", tag: "Free advice" },
];

const process = [
  { icon: Boxes, title: "Order online", text: "Pick your products and check out securely in under a minute." },
  { icon: Truck, title: "We dispatch fast", text: "Packed and shipped the same day, with tracking sent to your phone." },
  { icon: BadgeCheck, title: "Delivered & verified", text: "Scratch the authenticity seal to confirm your genuine Oraimo product." },
  { icon: Wrench, title: "Backed for a year", text: "Any issue in 12 months? We repair or replace, no drama." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Services that go"
        accent="beyond the box"
        description="Buying the product is the easy part. Delivery, warranty, trade-in, support — here's everything that comes with shopping Oraimo."
        crumbs={[{ label: "Services" }]}
      />

      <section className="container-x py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="card-surface group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-brand-950 dark:text-brand-400">
                    <s.icon size={22} />
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                    {s.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="From cart to" accent="covered" align="center" />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.title} index={i}>
                <div className="relative text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500 text-brand-950 shadow-glow">
                    <p.icon size={24} />
                  </span>
                  <span className="mt-4 block font-display text-xs font-bold uppercase tracking-widest text-muted">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 font-display font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[2rem] border border-border bg-gradient-to-br from-brand-500/10 to-transparent p-8 lg:grid-cols-[1.4fr_1fr] lg:p-12">
            <div>
              <span className="eyebrow"><Boxes size={14} /> For business</span>
              <h2 className="mt-3 font-display text-3xl font-bold">Supplying a team, office or store?</h2>
              <p className="mt-4 max-w-lg text-muted">
                From ten units to ten thousand, we handle volume pricing, proper invoicing, and a
                dedicated account manager so procurement is painless. Tell us what you need and we&apos;ll
                quote within a day.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link href="/contact">Request a quote</Link></Button>
                <Button asChild size="lg" variant="outline"><Link href="/shop">Browse catalogue</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "48h", v: "Quote turnaround" },
                { k: "10+", v: "Unit minimum" },
                { k: "1", v: "Account manager" },
                { k: "12mo", v: "Warranty on all" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-surface p-5 text-center">
                  <p className="font-display text-3xl font-bold text-brand-600 dark:text-brand-400">{s.k}</p>
                  <p className="mt-1 text-xs text-muted">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}

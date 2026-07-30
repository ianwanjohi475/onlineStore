import type { Metadata } from "next";
import { Award, Globe2, Heart, Leaf, ShieldCheck, Truck } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Stats } from "@/components/home/stats";
import { CtaBanner } from "@/components/home/cta-banner";

export const metadata: Metadata = {
  title: "About",
  description: "Our mission: put genuine, reliable Oraimo technology in every hand across Kenya — backed by real warranty and fast, honest service.",
};

const values = [
  { icon: ShieldCheck, title: "Genuine, always", text: "We're an authorised channel. Every product is 100% genuine and warranty-backed — no grey imports, ever." },
  { icon: Heart, title: "Built for daily life", text: "Every item is chosen because it survives real use — commutes, kids, workouts and everything between." },
  { icon: Leaf, title: "Responsibly packed", text: "Recyclable packaging and efficient logistics, because good tech shouldn't cost the planet." },
  { icon: Globe2, title: "Local support", text: "A real team on WhatsApp and phone, answering in minutes — not a ticket queue on another continent." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Powered for"
        accent="life"
        description="We exist to make premium, dependable technology accessible to everyone — and to stand behind every product long after you've bought it."
        crumbs={[{ label: "About" }]}
      />

      <section className="container-x grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-brand-500/20 to-brand-950">
            <div className="absolute inset-0 grid place-items-center">
              <Award size={80} className="text-brand-300/40" />
            </div>
          </div>
        </Reveal>
        <Reveal index={1}>
          <span className="eyebrow">Since day one</span>
          <h2 className="mt-3 font-display text-3xl font-bold">Technology that keeps its promises</h2>
          <div className="mt-4 space-y-4 text-muted">
            <p>We started with a simple frustration: great accessories were either overpriced or unreliable, and getting help after a purchase felt impossible. So we built the store we wished existed.</p>
            <p>Today we deliver genuine Oraimo audio, wearables and power to 47 cities across Kenya — fast, fairly priced, and backed by a warranty we actually honour. Over two million products later, that promise hasn&apos;t changed.</p>
          </div>
        </Reveal>
      </section>

      <Stats />

      <section className="container-x py-16">
        <SectionHeading eyebrow="What we stand for" title="Our" accent="values" align="center" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} index={i}>
              <div className="card-surface h-full p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 dark:text-brand-400">
                  <v.icon size={22} />
                </span>
                <h3 className="mt-4 font-display font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="warranty" className="container-x py-16">
        <Reveal>
          <div className="card-surface grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-12">
            <div>
              <span className="eyebrow"><ShieldCheck size={14} /> Warranty & returns</span>
              <h2 className="mt-3 font-display text-3xl font-bold">A warranty that actually works</h2>
              <p className="mt-4 text-muted">Every product carries a 12-month manufacturer warranty. Audio and wearables add a 15-day no-questions replacement window. Claims are handled in-app or over WhatsApp — most are resolved the same day.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, t: "12-month warranty", s: "On every product" },
                { icon: Truck, t: "Free return shipping", s: "On faulty items" },
                { icon: Heart, t: "15-day change of mind", s: "Unopened items" },
                { icon: Award, t: "Authenticity seal", s: "Scratch to verify" },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-border p-4">
                  <c.icon size={22} className="text-brand-600 dark:text-brand-400" />
                  <p className="mt-3 text-sm font-semibold">{c.t}</p>
                  <p className="text-xs text-muted">{c.s}</p>
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

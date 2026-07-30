import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const collections = [
  {
    title: "The Sound Edit",
    copy: "Earbuds & speakers tuned for depth",
    href: "/categories/earbuds",
    gradient: ["#00E676", "#0B3D2E"] as const,
    span: "lg:col-span-2",
  },
  {
    title: "Powered Up",
    copy: "Banks & chargers that go the distance",
    href: "/categories/power-banks",
    gradient: ["#7CFF6B", "#123524"] as const,
    span: "",
  },
  {
    title: "On the Wrist",
    copy: "Smartwatches for every goal",
    href: "/categories/smartwatches",
    gradient: ["#34F5C5", "#0A2540"] as const,
    span: "",
  },
  {
    title: "Everyday Carry",
    copy: "Cables & accessories built to last",
    href: "/categories/accessories",
    gradient: ["#22F58C", "#052E1C"] as const,
    span: "lg:col-span-2",
  },
];

export function Collections() {
  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow="Curated"
        title="Featured"
        accent="collections"
        description="Shortcuts to the setups our customers reach for most."
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {collections.map((c, i) => (
          <Reveal key={c.title} index={i} className={c.span}>
            <Link
              href={c.href}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-3xl border border-border p-7"
              style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
            >
              <div aria-hidden className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
              <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-2xl" />
              <div className="relative flex items-end justify-between text-white">
                <div>
                  <h3 className="font-display text-2xl font-bold">{c.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{c.copy}</p>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-white/20 backdrop-blur transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-brand-950">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

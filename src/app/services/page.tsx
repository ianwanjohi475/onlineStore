import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck, Cable, Camera, Cpu, Handshake, Headset, Network, Phone,
  Router, ShieldCheck, Truck, Wifi, Wrench,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CtaBanner } from "@/components/home/cta-banner";

export const metadata: Metadata = {
  title: "Services",
  description:
    "SIR VERT ENTERPRISE networking & technical services: fibre splicing, WiFi installation, router configuration, structured cabling, CCTV installation and PC repair — plus fast delivery and genuine warranty on every product.",
};

const networking = [
  { icon: Network, title: "Fibre splicing", text: "Professional fusion splicing and termination for FTTH and backbone fibre, with clean, low-loss joins and proper testing." },
  { icon: Wifi, title: "WiFi installation", text: "Whole-home and office WiFi — surveyed, installed and tuned for strong, reliable coverage in every corner." },
  { icon: Router, title: "Router configuration", text: "Router and access-point setup, secure passwords, guest networks, port forwarding, VLANs and firmware updates." },
  { icon: Cable, title: "Structured cabling", text: "Neat, labelled network cabling and patch panels for homes, offices and shops — done to standard." },
  { icon: Camera, title: "CCTV & IP cameras", text: "Supply and installation of IP and CCTV cameras with remote viewing on your phone, day or night." },
  { icon: Cpu, title: "PC repair & setup", text: "Diagnostics, upgrades, OS installs, virus clean-ups and data recovery for laptops and desktops." },
];

const retail = [
  { icon: Truck, title: "Fast delivery", text: "Same-day dispatch and quick delivery across Nairobi and countrywide, with free delivery over KES 5,000." },
  { icon: ShieldCheck, title: "Genuine & warranted", text: "Authentic products backed by warranty and responsive local support — we stand behind what we sell." },
  { icon: Handshake, title: "Business & bulk supply", text: "Volume pricing, invoicing and account support for offices, schools and resellers." },
  { icon: Headset, title: "Expert advice", text: "Not sure what you need? Talk to us — we help you pick the right product or service for the job." },
];

const process = [
  { icon: Phone, title: "Get in touch", text: "Call or WhatsApp us with what you need. When you call, we answer." },
  { icon: BadgeCheck, title: "Free assessment", text: "We assess the site or job and give you a clear, honest quote." },
  { icon: Wrench, title: "We do the work", text: "Our technicians handle the installation or repair professionally." },
  { icon: ShieldCheck, title: "Backed & supported", text: "We test everything and stay available for follow-up support." },
];

const PHONE = "+254 799 239 739";
const WHATSAPP = "254799239739";

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Networking & technical services"
        title="Fibre, WiFi, CCTV"
        accent="& PC repair"
        description="SIR VERT ENTERPRISE is more than a shop. We are your networking consultant — fibre splicing, WiFi installation, router configuration, structured cabling, CCTV and PC repair, delivered by technicians who get it right the first time."
        crumbs={[{ label: "Services" }]}
      />

      <section className="container-x py-16">
        <SectionHeading eyebrow="Networking consultancy" title="What we" accent="install & fix" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {networking.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="card-surface group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-card">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-brand-950 dark:text-brand-400">
                  <s.icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.text}</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Request this service →</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* contact strip */}
      <section className="border-y border-border bg-surface py-10">
        <div className="container-x flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-xl font-bold">Book a technician today</h2>
            <p className="mt-1 text-muted">Call or WhatsApp SIR VERT ENTERPRISE — {PHONE}. When you call, we answer.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><a href={`tel:${WHATSAPP}`}><Phone size={18} /> Call now</a></Button>
            <Button asChild size="lg" variant="outline"><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a></Button>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <SectionHeading eyebrow="Shopping with us" title="More than" accent="the sale" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {retail.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="card-surface flex h-full flex-col p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 dark:text-brand-400"><s.icon size={20} /></span>
                <h3 className="mt-4 font-display font-bold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="From call to" accent="completed" align="center" />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.title} index={i}>
                <div className="relative text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500 text-brand-950 shadow-glow"><p.icon size={24} /></span>
                  <span className="mt-4 block font-display text-xs font-bold uppercase tracking-widest text-muted">Step {i + 1}</span>
                  <h3 className="mt-1 font-display font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

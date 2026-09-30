import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { ContactForm } from "@/components/contact/contact-form";
import { faqs } from "@/lib/data/content";
import { getSettings } from "@/lib/store/store";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & support",
  description: "Get help from SIR VERT ENTERPRISE — WhatsApp, phone or email. When you call, we answer.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = formatPhone(settings.whatsapp);
  const digits = settings.whatsapp.replace(/\D/g, "");
  const channels = [
    { icon: MessageCircle, label: "WhatsApp", value: phone, sub: "Fastest — replies in minutes", href: digits ? `https://wa.me/${digits}` : undefined },
    { icon: Phone, label: "Call us", value: phone, sub: "Mon–Sat, 8am–8pm", href: digits ? `tel:+${digits}` : undefined },
    { icon: Mail, label: "Email", value: settings.supportEmail, sub: "We reply within a few hours", href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined },
    { icon: MapPin, label: "Visit", value: settings.address, sub: "Pickup & walk-in support", href: undefined },
  ].filter((c) => c.value);
  return (
    <>
      <PageHero
        eyebrow="We're here to help"
        title="Get in"
        accent="touch"
        description="Questions about a product, an order, or a warranty claim? Reach us however suits you — we answer fast."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          {channels.map((c) => (
            <a key={c.label} href={c.href} target={c.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card-surface flex items-center gap-4 p-5 transition-colors hover:border-brand-500/40">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 dark:text-brand-400">
                <c.icon size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{c.label}</p>
                <p className="font-semibold">{c.value}</p>
                <p className="text-xs text-muted">{c.sub}</p>
              </div>
            </a>
          ))}
          <div className="card-surface flex items-center gap-3 p-5 text-sm text-muted">
            <Clock size={18} className="text-brand-500" /> Average first response: under 10 minutes on WhatsApp.
          </div>
        </div>

        <ContactForm />
      </section>

      <section id="faq" className="container-x py-14">
        <SectionHeading eyebrow="Answers" title="Frequently asked" accent="questions" align="center" />
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </section>
    </>
  );
}

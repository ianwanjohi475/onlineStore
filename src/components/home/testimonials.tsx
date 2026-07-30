import { Quote } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/data/content";

export function Testimonials() {
  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow="Real reviews"
        title="Loved by"
        accent="Kenya"
        align="center"
        description="Over 180,000 five-star ratings and counting. Here's what a few of them say."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} index={i}>
            <figure className="card-surface flex h-full flex-col p-6">
              <Quote size={28} style={{ color: t.accent }} className="mb-3 opacity-80" />
              <blockquote className="flex-1 text-sm leading-relaxed">{t.quote}</blockquote>
              <Rating value={t.rating} className="mt-4" />
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <span
                  className="grid size-10 place-items-center rounded-full font-display font-bold text-brand-950"
                  style={{ background: t.accent }}
                >
                  {t.author.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

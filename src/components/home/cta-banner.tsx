import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CtaBanner() {
  return (
    <section className="container-x py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0b1220] px-6 py-16 text-center text-white sm:px-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-brand-500 opacity-20 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow justify-center text-brand-400">Powered for life</span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Upgrade your everyday tech <span className="text-gradient">today.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-brand-100/70">
              Genuine gear, unbeatable flash-sale prices, and a warranty that has your back.
              Free delivery on your first order.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/shop">
                  Start shopping <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass" className="text-brand-50">
                <Link href="/flash-sales">Browse flash sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

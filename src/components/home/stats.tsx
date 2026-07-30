"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { brandStats } from "@/lib/data/content";

function CountUp({ value, decimal }: { value: number; decimal?: boolean }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value]);

  const formatted = decimal
    ? display.toFixed(1)
    : display >= 1000
      ? `${(display / (display >= 1_000_000 ? 1_000_000 : 1000)).toFixed(display >= 1_000_000 ? 1 : 0)}${display >= 1_000_000 ? "M" : "K"}`
      : Math.round(display).toString();

  return <span ref={ref}>{formatted}</span>;
}

export function Stats() {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-brand-950 px-6 py-14 text-brand-50">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-0 size-72 rounded-full bg-brand-500 opacity-20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 size-72 rounded-full bg-brand-400 opacity-10 blur-3xl" />
          </div>
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {brandStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl font-bold tabular-nums text-brand-300 sm:text-5xl">
                  <CountUp value={s.value} decimal={s.decimal} />
                  {s.suffix}
                </p>
                <p className="mt-2 text-sm text-brand-100/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

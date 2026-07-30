"use client";

import { CheckCircle2, Circle, MapPin, Package, Search, Truck } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";

const timeline = [
  { icon: CheckCircle2, title: "Order confirmed", detail: "We received your order and payment", time: "24 Jul, 9:12am", done: true },
  { icon: Package, title: "Packed & ready", detail: "Your items were packed at our Nairobi hub", time: "24 Jul, 2:40pm", done: true },
  { icon: Truck, title: "Out for delivery", detail: "Rider is on the way to your address", time: "25 Jul, 8:05am", done: true, active: true },
  { icon: MapPin, title: "Delivered", detail: "Estimated by 12:00pm today", time: "Pending", done: false },
];

export default function TrackOrderPage() {
  const [tracking, setTracking] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Where's my order?"
        title="Track your"
        accent="delivery"
        description="Enter your order number to see live progress from our warehouse to your door."
        crumbs={[{ label: "Track order" }]}
      />

      <div className="container-x max-w-2xl py-14">
        <form
          onSubmit={(e) => { e.preventDefault(); setTracking(true); }}
          className="card-surface flex flex-col gap-3 p-4 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4">
            <Search size={18} className="text-muted" />
            <input required placeholder="e.g. ORA-482910" defaultValue="ORA-482910" className="h-11 flex-1 bg-transparent outline-none" />
          </div>
          <Button type="submit" size="lg">Track order</Button>
        </form>

        {tracking && (
          <div className="card-surface mt-6 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-semibold">Order ORA-482910</p>
                <p className="text-xs text-muted">Estimated delivery: today by 12:00pm</p>
              </div>
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-600">In transit</span>
            </div>

            <ol className="mt-6 space-y-6">
              {timeline.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-10 place-items-center rounded-full ${step.done ? "bg-brand-500/15 text-brand-600 dark:text-brand-400" : "bg-surface-2 text-muted"}`}>
                      {step.done ? <step.icon size={20} /> : <Circle size={20} />}
                    </span>
                    {i < timeline.length - 1 && <span className={`mt-1 h-10 w-px ${step.done ? "bg-brand-500/40" : "bg-border"}`} />}
                  </div>
                  <div className={step.active ? "" : "opacity-90"}>
                    <p className={`font-semibold ${step.active ? "text-brand-600 dark:text-brand-400" : ""}`}>{step.title}</p>
                    <p className="text-sm text-muted">{step.detail}</p>
                    <p className="mt-0.5 text-xs text-muted">{step.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}

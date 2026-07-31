import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: Truck, title: "Fast delivery", text: "Next-day in Nairobi" },
  { icon: ShieldCheck, title: "Genuine & warrantied", text: "12-month cover" },
  { icon: RotateCcw, title: "Easy returns", text: "15-day window" },
  { icon: Headset, title: "24/7 support", text: "Chat on WhatsApp" },
];

export function ServiceStrip() {
  return (
    <section className="container-x py-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3 bg-surface p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-600 dark:text-brand-400">
              <it.icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{it.title}</p>
              <p className="truncate text-xs text-muted">{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

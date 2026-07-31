"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  { text: "Flash Sale — up to 40% off audio", href: "/flash-sales", cta: "Shop deals" },
  { text: "Free next-day delivery in Nairobi over KES 5,000", href: "/shop", cta: "Start shopping" },
  { text: "12-month warranty on every genuine product", href: "/about#warranty", cta: "Learn more" },
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, []);

  if (closed) return null;
  const m = messages[i];

  return (
    <div className="relative bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 text-brand-50">
      <div className="container-x flex h-9 items-center justify-center gap-3 text-xs">
        <Truck size={13} className="shrink-0 text-brand-400" />
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 truncate"
          >
            <span className="truncate font-medium">{m.text}</span>
            <Link href={m.href} className="hidden shrink-0 items-center gap-0.5 font-semibold text-brand-300 hover:text-brand-200 sm:inline-flex">
              {m.cta} <ChevronRight size={12} />
            </Link>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setClosed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-4 text-brand-200/70 transition-colors hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

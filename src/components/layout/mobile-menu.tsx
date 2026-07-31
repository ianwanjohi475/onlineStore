"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { categories } from "@/lib/data/categories";

const primary = [
  { href: "/shop", label: "Shop all" },
  { href: "/services", label: "Services" },
  { href: "/flash-sales", label: "Flash sales" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track order" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 left-0 z-[96] flex w-[min(86vw,22rem)] flex-col bg-surface p-5 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {primary.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-3 font-semibold transition-colors hover:bg-surface-2"
                >
                  {l.label}
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              ))}
            </div>

            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Categories</p>
            <div className="flex flex-col gap-1">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
                >
                  <span className="size-2.5 rounded-full" style={{ background: c.gradient[0] }} />
                  {c.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

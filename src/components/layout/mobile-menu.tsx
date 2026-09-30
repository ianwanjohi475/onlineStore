"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Heart, MessageCircle, Package, Store, User, X } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useCatalog } from "@/context/catalog";
import { Portal, useScrollLock } from "@/hooks/use-overlay";
import { Logo } from "./logo";

const quick = [
  { href: "/account", label: "Account", icon: User },
  { href: "/track-order", label: "My orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
];

const primary = [
  { href: "/shop", label: "Shop all" },
  { href: "/flash-sales", label: "Flash sales" },
  { href: "/services", label: "Networking services" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, settings } = useCatalog();
  useScrollLock(open);
  const wa = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "/contact";

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[120] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.nav
              aria-label="Main menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="fixed left-0 top-0 z-[121] flex h-dvh w-[min(86vw,22rem)] flex-col bg-surface shadow-2xl lg:hidden"
            >
              {/* fixed top */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <Logo />
                <button onClick={onClose} aria-label="Close menu" className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
                  <X size={18} />
                </button>
              </div>

              {/* scrollable body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-6">
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {quick.map((q) => (
                    <Link
                      key={q.href}
                      href={q.href}
                      onClick={onClose}
                      className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3 text-xs font-semibold transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5"
                    >
                      <q.icon size={18} className="text-brand-500" />
                      {q.label}
                    </Link>
                  ))}
                </div>

                <p className="mb-1 mt-5 px-2 text-xs font-bold uppercase tracking-wider text-muted">Shop by category</p>
                <div className="flex flex-col">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categories/${c.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2">
                        <CategoryIcon slug={c.slug} className="size-6" />
                      </span>
                      <span className="flex-1">{c.name}</span>
                      <ChevronRight size={15} className="text-muted" />
                    </Link>
                  ))}
                </div>

                <p className="mb-1 mt-5 px-2 text-xs font-bold uppercase tracking-wider text-muted">More</p>
                <div className="flex flex-col">
                  {primary.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
                    >
                      <span className="flex items-center gap-3"><Store size={16} className="text-muted" /> {l.label}</span>
                      <ChevronRight size={15} className="text-muted" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* fixed bottom */}
              <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white"
                >
                  <MessageCircle size={17} /> Chat on WhatsApp
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}

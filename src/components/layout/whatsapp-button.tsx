"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalog } from "@/context/catalog";

export function WhatsAppButton() {
  const { settings } = useCatalog();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[80] flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            className="glass w-64 rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-[#25D366] text-white">
                <MessageCircle size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">Oraimo Support</p>
                <p className="text-xs text-brand-600 dark:text-brand-400">● Online now</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">
              Hi 👋 Need help choosing? Chat with us on WhatsApp — we usually reply in minutes.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={16} /> Start chat
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="WhatsApp support"
        className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" aria-hidden />
        )}
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </motion.button>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "⚡ Flash Sale — up to 40% off audio, ends soon",
  "🚚 Free next-day delivery in Nairobi on orders over KES 5,000",
  "🛡️ 12-month warranty on every genuine Oraimo product",
  "🎁 Student offer — extra 10% off with a valid ID",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden bg-brand-950 text-brand-50">
      <div className="container-x flex h-9 items-center justify-center text-center text-xs font-medium">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {messages[i]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

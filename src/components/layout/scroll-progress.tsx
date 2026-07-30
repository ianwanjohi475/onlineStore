"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brand-400 to-brand-600"
      aria-hidden
    />
  );
}

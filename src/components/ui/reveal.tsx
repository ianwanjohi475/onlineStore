"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const base: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Scroll-triggered reveal. Wrap any block; use `index` to stagger siblings. */
export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={base}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

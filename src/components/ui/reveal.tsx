import type { ReactNode } from "react";

/**
 * Formerly a scroll-triggered fade-in. Content now renders immediately — fade-ins
 * made pages feel slow to appear when navigating, so this is a plain wrapper
 * kept for API compatibility.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  return <Tag className={className}>{children}</Tag>;
}

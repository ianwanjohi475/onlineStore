import { IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const TINTS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
];

/** Reviewer avatar as an icon (no real people's photos), tinted per name. */
export function AvatarIcon({ name, className, size = 20 }: { name: string; className?: string; size?: number }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full", TINTS[h % TINTS.length], className)}>
      <IconUser size={size} stroke={1.75} />
    </span>
  );
}

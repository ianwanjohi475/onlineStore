import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  crumbs = [],
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden border-b border-border", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-20 size-72 rounded-full bg-brand-500 opacity-10 blur-[100px]" />
        <div className="absolute right-0 top-0 size-72 rounded-full bg-brand-600 opacity-10 blur-[100px]" />
      </div>
      <div className="container-x py-14">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground">{c.label}</Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          {title} {accent && <span className="text-gradient">{accent}</span>}
        </h1>
        {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
      </div>
    </header>
  );
}

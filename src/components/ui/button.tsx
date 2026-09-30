import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "glass" | "dark";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-cta text-navy font-bold hover:bg-cta-600 shadow-[0_10px_24px_-12px_var(--color-cta-700)]",
  outline:
    "border border-border bg-surface text-foreground hover:border-foreground/40 hover:bg-surface-2",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  glass: "glass text-foreground hover:border-brand-500/50",
  dark: "bg-navy text-white hover:bg-navy-3",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2.5",
  icon: "size-11 justify-center",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex select-none items-center justify-center rounded-full font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-brand-500 text-brand-950",
  bestseller: "bg-foreground text-background",
  sale: "bg-rose-500 text-white",
  limited: "bg-amber-400 text-amber-950",
};

const labels: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  sale: "Sale",
  limited: "Limited",
};

export function Badge({ kind, className }: { kind: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide",
        styles[kind] ?? "bg-surface-2 text-foreground",
        className,
      )}
    >
      {labels[kind] ?? kind}
    </span>
  );
}

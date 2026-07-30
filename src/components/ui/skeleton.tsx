import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-surface-2",
        "after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent after:bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden p-3">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}

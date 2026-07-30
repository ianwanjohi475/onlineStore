import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-label={`Rated ${value} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-brand-500 text-brand-500" : "fill-transparent text-muted/50"}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-muted tabular-nums">
        {value.toFixed(1)}
        {count != null && <span className="text-muted/70"> ({count.toLocaleString()})</span>}
      </span>
    </div>
  );
}

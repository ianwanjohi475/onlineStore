import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-2xl text-center items-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow">
          <span className="h-px w-6 bg-brand-500" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-[2.75rem]">
        {title} {accent && <span className="text-gradient">{accent}</span>}
      </h2>
      {description && (
        <p className={cn("max-w-xl text-muted", align === "center" && "mx-auto")}>{description}</p>
      )}
    </Reveal>
  );
}

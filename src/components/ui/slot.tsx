import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Minimal Slot: merges props/className onto a single child element (asChild pattern). */
export function Slot({
  children,
  className,
  ...props
}: { children?: ReactNode; className?: string } & Record<string, unknown>) {
  if (!isValidElement(children)) return null;
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  return cloneElement(child, {
    ...props,
    ...childProps,
    className: cn(className, childProps.className as string | undefined),
  });
}

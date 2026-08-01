"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLive } from "@/hooks/use-live";

/**
 * Keeps the storefront in sync with admin changes in real time: when the store
 * version bumps (a price edit, a new banner, stock selling out), it refreshes
 * the current route's server components without a full page reload.
 */
export function LiveRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLive(() => {
    // debounce bursts of changes into a single refresh
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), 400);
  });

  return null;
}

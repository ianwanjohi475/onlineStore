"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface RecentlyViewedValue {
  slugs: string[];
  push: (slug: string) => void;
  hydrated: boolean;
}

const Ctx = createContext<RecentlyViewedValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs, hydrated] = useLocalStorage<string[]>("oraimo.recent", []);

  const push = useCallback(
    (slug: string) => setSlugs((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8)),
    [setSlugs],
  );

  const value = useMemo(() => ({ slugs, push, hydrated }), [slugs, push, hydrated]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}

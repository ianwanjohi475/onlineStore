"use client";

import { useCallback, useEffect, useState } from "react";

/** localStorage-backed state that is SSR-safe (starts from `initial`, hydrates on mount). */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / unavailable */
    }
  }, [key, value, hydrated]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => setValue(next),
    [],
  );

  return [value, update, hydrated] as const;
}

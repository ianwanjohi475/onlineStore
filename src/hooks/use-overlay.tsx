"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Stops the page behind a drawer/modal from scrolling while it is open.
 * (On phones the page used to scroll underneath the menu, which also made the
 * browser bar collapse and left a gap at the bottom of the drawer.)
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [locked]);
}

/** Renders overlays straight into <body>, so no parent transform or sticky
 *  container can clip them — they always cover the full screen. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

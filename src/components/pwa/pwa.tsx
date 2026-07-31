"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function Pwa() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      if (!localStorage.getItem("oraimo.pwa.dismissed")) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("oraimo.pwa.dismissed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="glass fixed bottom-24 left-5 z-[80] flex w-[min(90vw,20rem)] items-center gap-3 rounded-2xl p-3 shadow-card"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500 text-brand-950">
            <Download size={20} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Install the Oraimo app</p>
            <p className="text-xs text-muted">Faster, works offline, on your home screen.</p>
          </div>
          <button
            onClick={install}
            className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-brand-950 transition-colors hover:bg-brand-400"
          >
            Install
          </button>
          <button onClick={dismiss} aria-label="Dismiss" className="text-muted hover:text-foreground">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

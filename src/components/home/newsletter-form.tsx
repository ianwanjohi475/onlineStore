"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/context/toast";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        setDone(true);
        toast("You're subscribed! Check your inbox 🎉");
        setEmail("");
        setTimeout(() => setDone(false), 2500);
      }}
      className={cn("flex w-full min-w-0 items-center gap-2 rounded-full border border-border bg-surface p-1.5", className)}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted sm:px-4"
      />
      <button
        type="submit"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:px-5"
      >
        {done ? <Check size={16} /> : <>Subscribe <ArrowRight size={15} /></>}
      </button>
    </form>
  );
}

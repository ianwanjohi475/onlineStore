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
      className={cn("flex items-center gap-2 rounded-full border border-border bg-surface p-1.5", className)}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="h-10 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-500 px-5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-400"
      >
        {done ? <Check size={16} /> : <>Subscribe <ArrowRight size={15} /></>}
      </button>
    </form>
  );
}

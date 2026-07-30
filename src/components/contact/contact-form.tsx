"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast";

export function ContactForm() {
  const toast = useToast();
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast("Message sent — we'll reply within a few hours");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSent(false), 2500);
      }}
      className="card-surface flex flex-col gap-4 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input required placeholder="Your name" className="h-11 rounded-xl border border-border bg-surface px-4 outline-none focus:border-brand-500" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input required type="email" placeholder="you@email.com" className="h-11 rounded-xl border border-border bg-surface px-4 outline-none focus:border-brand-500" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Subject</span>
        <input placeholder="How can we help?" className="h-11 rounded-xl border border-border bg-surface px-4 outline-none focus:border-brand-500" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Message</span>
        <textarea required rows={5} placeholder="Tell us a bit more…" className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand-500" />
      </label>
      <Button type="submit" size="lg" className="self-start">
        <Send size={16} /> {sent ? "Sent!" : "Send message"}
      </Button>
    </form>
  );
}

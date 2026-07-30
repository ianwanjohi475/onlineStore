"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-rose-500/12 text-rose-500">
        <TriangleAlert size={38} />
      </span>
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted">
        We hit an unexpected snag loading this page. Try again — and if it keeps happening, our team is a WhatsApp away.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}><RotateCcw size={18} /> Try again</Button>
        <Button asChild size="lg" variant="outline"><Link href="/">Back home</Link></Button>
      </div>
    </div>
  );
}

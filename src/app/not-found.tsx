import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="relative">
        <p className="font-display text-[9rem] font-bold leading-none text-gradient">404</p>
        <div aria-hidden className="absolute inset-0 -z-10 mx-auto size-64 rounded-full bg-brand-500 opacity-20 blur-[100px]" />
      </div>
      <h1 className="font-display text-2xl font-bold">This page took a coffee break</h1>
      <p className="max-w-md text-muted">
        The page you&apos;re after doesn&apos;t exist or has moved. Let&apos;s get you back to something brilliant.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg"><Link href="/"><Home size={18} /> Back home</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/shop"><Search size={18} /> Browse shop</Link></Button>
      </div>
    </div>
  );
}

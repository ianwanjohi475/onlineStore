import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-surface-2 text-muted">
        <WifiOff size={34} />
      </span>
      <h1 className="font-display text-2xl font-bold">You&apos;re offline</h1>
      <p className="max-w-sm text-muted">
        No connection right now. Pages and products you&apos;ve already viewed are still available —
        reconnect to see the latest deals.
      </p>
      <Button asChild size="lg"><Link href="/">Try the homepage</Link></Button>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { WhatsAppButton } from "./whatsapp-button";
import { LiveRefresh } from "./live-refresh";

/** Renders the storefront chrome everywhere except the /admin area. */
export function StoreChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <LiveRefresh />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {footer}
      <WhatsAppButton />
    </>
  );
}

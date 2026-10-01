"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { WhatsAppButton } from "./whatsapp-button";
import { GoogleOneTap } from "@/components/auth/google";

/** Renders the storefront chrome everywhere except the /admin area.
 *  (No live polling here: it pinged the server every 4s per visitor, which is
 *  slow and costly on serverless. Pages refresh via revalidation instead.) */
export function StoreChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {footer}
      <WhatsAppButton />
      <GoogleOneTap />
    </>
  );
}

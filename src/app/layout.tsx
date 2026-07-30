import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { ScrollProgress } from "@/components/layout/scroll-progress";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://oraimo-store.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oraimo — Smart Accessories, Powered for Life",
    template: "%s · Oraimo",
  },
  description:
    "Shop genuine Oraimo earbuds, smartwatches, power banks, chargers, cables and speakers. Fast delivery across Kenya, 12-month warranty and unbeatable flash-sale prices.",
  keywords: [
    "Oraimo",
    "earbuds",
    "smartwatch",
    "power bank",
    "charger",
    "USB-C cable",
    "bluetooth speaker",
    "Kenya electronics",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Oraimo — Smart Accessories, Powered for Life",
    description:
      "Genuine Oraimo audio, wearables and power. Fast delivery, 12-month warranty, flash-sale prices.",
    siteName: "Oraimo Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oraimo — Smart Accessories, Powered for Life",
    description: "Genuine Oraimo audio, wearables and power. Fast delivery across Kenya.",
  },
  icons: { icon: "/favicon.ico" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Oraimo Store",
  url: siteUrl,
  description: "Genuine Oraimo smart accessories with fast delivery and 12-month warranty.",
  brand: { "@type": "Brand", name: "Oraimo" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>
          <ScrollProgress />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}

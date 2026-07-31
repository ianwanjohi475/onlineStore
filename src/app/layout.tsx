import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoreChrome } from "@/components/layout/store-chrome";
import { Pwa } from "@/components/pwa/pwa";
import { getCategories, getProducts, getSettings } from "@/lib/store/store";

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
  manifest: "/manifest.webmanifest",
  applicationName: "Oraimo",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Oraimo" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

// Render on demand so admin edits to the store reflect immediately.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050a08" },
  ],
  width: "device-width",
  initialScale: 1,
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
  const products = getProducts();
  const categories = getCategories();
  const settings = getSettings();
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
        <Providers products={products} categories={categories} settings={settings}>
          <StoreChrome footer={<SiteFooter />}>{children}</StoreChrome>
          <Pwa />
        </Providers>
      </body>
    </html>
  );
}

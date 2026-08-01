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

const siteUrl = "https://sirvertenterprise.example";

export function generateMetadata(): Metadata {
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: getSettings().seoTitle,
    template: `%s · ${getSettings().brandName}`,
  },
  description: getSettings().seoDescription,
  keywords: [
    "SIR VERT ENTERPRISE",
    "earbuds",
    "smartwatch",
    "power bank",
    "charger",
    "home appliances",
    "computer accessories",
    "CCTV camera",
    "fibre splicing",
    "WiFi installation",
    "Kenya electronics",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: getSettings().seoTitle,
    description: getSettings().seoDescription,
    siteName: "SIR VERT ENTERPRISE",
  },
  twitter: {
    card: "summary_large_image",
    title: getSettings().seoTitle,
    description: getSettings().seoDescription,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "SIR VERT ENTERPRISE",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SIR VERT" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  };
}

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
  name: "SIR VERT ENTERPRISE",
  url: siteUrl,
  telephone: "+254799239739",
  description: "Electronics, smart gadgets and networking services — fibre splicing, WiFi installation, router configuration and PC repair. Fast delivery across Kenya.",
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

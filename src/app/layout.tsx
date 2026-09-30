import type { Metadata, Viewport } from "next";
import { safeJsonLd } from "@/lib/utils";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: settings.seoTitle,
    template: `%s · ${settings.brandName}`,
  },
  description: settings.seoDescription,
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
    title: settings.seoTitle,
    description: settings.seoDescription,
    siteName: "SIR VERT ENTERPRISE",
  },
  twitter: {
    card: "summary_large_image",
    title: settings.seoTitle,
    description: settings.seoDescription,
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

// Serve pages from Vercel's CDN cache and refresh them in the background at most
// once a minute. Admin edits and new orders call revalidatePath() so the site
// updates straight away — no need to rebuild every page for every visitor.
export const revalidate = 60;

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(orgJsonLd) }}
        />
        <Providers products={products} categories={categories} settings={settings}>
          <StoreChrome footer={<SiteFooter />}>{children}</StoreChrome>
          <Pwa />
        </Providers>
      </body>
    </html>
  );
}

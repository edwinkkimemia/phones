import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import StoreProviders from "@/components/Providers";
import { getSiteSettings } from "@/lib/site-settings";
import { getCategories } from "@/lib/catalog-server";

export const metadata: Metadata = {
  metadataBase: new URL("https://phonelaptops.co.ke"),
  title: {
    default: "PhoneLaptops.co.ke — Latest Laptops, iPhones & Phones in Kenya",
    template: "%s | PhoneLaptops.co.ke",
  },
  description:
    "Buy genuine laptops, iPhones, Samsung, Xiaomi, tablets & accessories in Kenya. Competitive prices, M-Pesa payments, fast countrywide delivery, warranty support.",
  keywords: [
    "laptops in Kenya",
    "buy laptops Kenya",
    "iPhones Kenya",
    "phones Kenya",
    "Samsung phones Kenya",
    "gaming laptops Kenya",
    "laptop shop Kenya",
  ],
  openGraph: {
    siteName: "PhoneLaptops.co.ke",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PhoneLaptops.co.ke — Latest Gadgets. Better Living. 0715 135 141",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@phonelaptopske",
    title: "PhoneLaptops.co.ke — Latest Laptops, iPhones & Phones in Kenya",
    description:
      "Genuine laptops, iPhones, phones & accessories at honest Kenyan prices. M-Pesa accepted, delivery across Kenya.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/fav.jpg",
    apple: "/fav.jpg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const categories = await getCategories();
  const navCats = categories.map((c) => ({ slug: c.slug, name: c.name }));
  return (
    <html lang="en-KE">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen pb-16 md:pb-0">
        <StoreProviders>
          <SiteChrome settings={settings} navCats={navCats}>
            {children}
          </SiteChrome>
        </StoreProviders>
      </body>
    </html>
  );
}

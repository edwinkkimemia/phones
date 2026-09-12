import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppFloat, MobileNav } from "@/components/chrome";
import { Toasts } from "@/components/toast";

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
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/fav.jpg",
    apple: "/fav.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MobileNav />
        <Toasts />
      </body>
    </html>
  );
}

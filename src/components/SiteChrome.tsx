"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WhatsAppFloat, MobileNav } from "@/components/chrome";
import { Toasts } from "@/components/toast";
import PromoPopup from "@/components/PromoPopup";
import AiAssistant from "@/components/AiAssistant";

// Storefront chrome (header, footer, floats, popups) renders everywhere
// EXCEPT /admin/* — the console has its own navbar and must never show
// the shop header, cart, mobile nav or marketing popups.
export default function SiteChrome({
  children,
  settings,
  navCats,
}: {
  children: React.ReactNode;
  settings: Record<string, string>;
  navCats: { slug: string; name: string }[];
}) {
  const path = usePathname();
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  if (isAdmin) {
    return (
      <>
        <main className="min-h-[60vh]">{children}</main>
        <Toasts />
      </>
    );
  }
  return (
    <>
      <Header
        phone={settings.phone_display}
        email={settings.email}
        announcement={settings.announcement}
        categories={navCats}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} categories={navCats} />
      <WhatsAppFloat phone={settings.whatsapp_number} />
      <MobileNav />
      <AiAssistant />
      <PromoPopup />
      <Toasts />
    </>
  );
}

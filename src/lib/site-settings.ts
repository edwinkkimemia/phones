import { prisma } from "@/lib/prisma";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, STORE_PHONE_DISPLAY } from "@/lib/utils";

export const SITE_DEFAULTS: Record<string, string> = {
  store_name: "PhoneLaptops.co.ke",
  tagline: "Latest Gadgets. Better Living.",
  announcement: "FAST DELIVERY • AUTHENTIC PRODUCTS • M-PESA ACCEPTED",
  phone_display: STORE_PHONE_DISPLAY,
  whatsapp_number: WHATSAPP_NUMBER,
  whatsapp_display: WHATSAPP_DISPLAY,
  email: "support@phonelaptops.co.ke",
  address: "Moi Avenue, Nairobi, Kenya",
  hours: "8am–8pm daily",
};

export const SITE_FIELDS: { key: string; label: string; hint: string }[] = [
  { key: "store_name", label: "Store name", hint: "Shown in the footer and metadata." },
  { key: "tagline", label: "Tagline", hint: "Under the logo in the footer." },
  { key: "announcement", label: "Announcement bar", hint: "Top strip above the header." },
  { key: "phone_display", label: "Phone (display)", hint: "Top bar + footer, e.g. +254 715 135 141." },
  { key: "whatsapp_number", label: "WhatsApp number", hint: "International format, no +: 254715135141. Powers every WhatsApp button." },
  { key: "whatsapp_display", label: "WhatsApp (display)", hint: "e.g. 0715 135 141." },
  { key: "email", label: "Support email", hint: "Top bar + footer + contact page fallback." },
  { key: "address", label: "Location", hint: "Footer + contact page." },
  { key: "hours", label: "Opening hours", hint: "Contact page." },
];

// Server-side read (used by the root layout). Falls back to defaults offline.
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...SITE_DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...SITE_DEFAULTS };
  }
}

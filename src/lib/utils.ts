import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function kes(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function discountPct(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function savings(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return compareAt - price;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254715135141";
export const WHATSAPP_DISPLAY = "0715 135 141";
export const STORE_PHONE_DISPLAY = "+254 715 135 141";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappMessage(
  name: string,
  price: number,
  url: string
): string {
  return `Hello PhoneLaptops, I'm interested in the ${name} listed at ${kes(
    price
  )}. Link: ${url}`;
}

export function orderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PL-${ymd}-${rand}`;
}

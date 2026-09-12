"use client";
import { useEffect, useState } from "react";
import { Share2, Link2, Check, Facebook, Twitter } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { toast } from "@/components/toast";

// Social share row for product pages (free distribution loop).
export default function ShareButtons({ name, price }: { name: string; price: number }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const text = `${name} — KES ${price.toLocaleString("en-KE")} at PhoneLaptops.co.ke`;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, Icon: WhatsAppIcon },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, Icon: Twitter },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, Icon: Facebook },
  ];

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
        <Share2 className="h-3.5 w-3.5" /> Share:
      </span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share on ${label}`}
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-400 hover:text-brand-700"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url || window.location.href);
            setCopied(true);
            toast("Link copied", "Share this deal with a friend.");
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast("Copy failed", "Long-press the URL to copy it.");
          }
        }}
        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-400 hover:text-brand-700"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

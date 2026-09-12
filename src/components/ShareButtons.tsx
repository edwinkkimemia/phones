"use client";
import { useEffect, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { WhatsAppIcon, XIcon, FacebookIcon } from "@/components/icons";
import { toast } from "@/components/toast";

// Social share row for product / blog pages (free distribution loop).
// - Brand-correct icon colors (WhatsApp green, X black, Facebook blue).
// - Proper canonical share links (pass `url`, falls back to current page URL).
// - Always shares the admin/global canonical URL when provided, so crawlers
//   and apps unfurl the right page instead of a URL with query params.
export default function ShareButtons({
  name,
  price,
  url,
}: {
  name: string;
  price?: number;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");

  useEffect(() => {
    if (!url) setBrowserUrl(window.location.href);
  }, [url]);

  const shareUrl = url || browserUrl;
  const text =
    typeof price === "number"
      ? `${name} — KES ${price.toLocaleString("en-KE")} at PhoneLaptops.co.ke`
      : `${name} — via PhoneLaptops.co.ke`;

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`.trim())}`,
      Icon: WhatsAppIcon,
      className:
        "border-[#25D366]/40 text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      Icon: XIcon,
      className:
        "border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
      Icon: FacebookIcon,
      className:
        "border-[#1877F2]/40 text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
  ];

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
        <Share2 className="h-3.5 w-3.5" /> Share:
      </span>
      {links.map(({ label, href, Icon, className }) => (
        <a
          key={label}
          href={shareUrl ? href : undefined}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Share on ${label}`}
          title={`Share on ${label}`}
          aria-disabled={!shareUrl}
          onClick={(e) => {
            if (!shareUrl) e.preventDefault();
          }}
          className={`grid h-8 w-8 place-items-center rounded-full border transition ${className} ${!shareUrl ? "pointer-events-none opacity-40" : ""}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        aria-label="Copy link"
        title="Copy link"
        onClick={async () => {
          const toCopy = shareUrl || window.location.href;
          try {
            await navigator.clipboard.writeText(toCopy);
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

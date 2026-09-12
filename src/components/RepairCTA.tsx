import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/utils";

// Cross-sell promo for the parts business ("Repair, Don't Replace").
// Shown on content + info pages (blog, guides, about, FAQs, track-order,
// contact, delivery, warranty) to route repair intent to /phone-parts.
export default function RepairCTA() {
  return (
    <section className="container-x py-10 md:py-14">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 260px at 12% 20%, rgba(0,230,118,.18), transparent), radial-gradient(500px 240px at 88% 30%, rgba(43,107,255,.35), transparent)",
          }}
        />
        <div className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Wrench className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Repair, Don&apos;t Replace</p>
            <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Original Phone Parts</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              Original AMOLED screens, zero-cycle batteries and pro toolkits — with free fitting
              advice and Nairobi fitting on request. Fix it for a fraction of a new phone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              {["✓ Original Quality", "✓ 100% Battery Health", "✓ Fitting Available"].map((b) => (
                <span key={b} className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5">{b}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-2 md:justify-items-end">
            <Link href="/phone-parts" className="btn-primary w-full !bg-accent !text-ink-950 hover:!bg-white md:w-auto">
              Shop phone parts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/laptop-parts" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">
              Laptop parts
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello PhoneLaptops! I need free fitting advice for a phone part.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp w-full md:w-auto"
            >
              <WhatsAppIcon className="h-4 w-4" /> Free fitting advice
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

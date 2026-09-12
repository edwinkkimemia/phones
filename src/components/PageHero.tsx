import Image from "next/image";

// Shared dark hero banner (same look as the category heroes): full-bleed
// panel below the navbar, eyebrow + H1 + blurb + up to 3 badges, optional
// backdrop photo. Every page supplies its own custom copy.
export default function PageHero({
  eyebrow,
  heading,
  blurb,
  badges = [],
  image,
}: {
  eyebrow: string;
  heading: string;
  blurb?: string;
  badges?: string[];
  image?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-ink-950 text-white">
      {image && (
        <Image src={image} alt="" aria-hidden="true" fill priority className="object-cover opacity-45" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/65 to-ink-950/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 260px at 12% 20%, rgba(43,107,255,.35), transparent), radial-gradient(500px 240px at 88% 30%, rgba(0,213,255,.16), transparent)",
        }}
      />
      <div className="container-x relative py-10 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h1>
        {blurb && <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200">{blurb}</p>}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {badges.map((b) => (
              <span key={b} className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">{b}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

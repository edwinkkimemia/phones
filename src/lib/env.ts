// Central env resolution with safe fallbacks.
// next-auth REQUIRES a stable secret in production — without one every
// /api/auth/* route 500s (NO_SECRET) and all logins die. If NEXTAUTH_SECRET
// was never set, derive a deterministic secret from DATABASE_URL so auth
// works immediately; it only rotates if the DB URL itself changes.
// Edge-safe (pure JS — also imported by middleware).

function cyrb53(str: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

let warned = false;
let cached: string | null = null;

export function authSecret(): string {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  if (cached) return cached;
  const db = process.env.DATABASE_URL;
  if (!warned) {
    warned = true;
    console.warn(
      "[phonelaptops] NEXTAUTH_SECRET is not set — using a derived fallback secret so auth keeps working. " +
        "Set a real long random NEXTAUTH_SECRET in Vercel env vars for production hygiene."
    );
  }
  const base = db ?? "phonelaptops-dev-fallback";
  cached = [7, 41, 97, 211].map((s) => cyrb53(`${base}::phonelaptops-auth::${s}`, s)).join("");
  return cached;
}

export function authUrl(): string {
  return process.env.NEXTAUTH_URL || "https://phonelaptops.co.ke";
}

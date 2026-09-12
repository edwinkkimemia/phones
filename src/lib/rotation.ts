// Deterministic daily rotation so homepage picks (and hero features)
// change every day without hydration mismatches or API calls.
// NOTE: pages using this must revalidate at least daily (ISR).

export function daySeed(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministically shuffled copy (same input + salt + day = same output). */
export function shuffled<T>(arr: T[], salt = "", seed = daySeed()): T[] {
  const out = [...arr];
  const rand = mulberry32(hashStr(`${salt}::${seed}`));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick n distinct items, rotating daily. */
export function pickDaily<T>(arr: T[], n: number, salt = "", seed = daySeed()): T[] {
  if (arr.length <= n) return [...arr];
  return shuffled(arr, salt, seed).slice(0, n);
}

/** Rotate a pre-sorted list (e.g. best sellers) by a daily offset. */
export function rotate<T>(arr: T[], salt = "", seed = daySeed()): T[] {
  if (arr.length === 0) return arr;
  const off = hashStr(`${salt}::${seed}`) % arr.length;
  return [...arr.slice(off), ...arr.slice(0, off)];
}

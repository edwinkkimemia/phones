"use client";

// Browser-level creative check: loads the URL exactly the way AdSlot will.
// Resolves true when the image decodes, false on error (dead link, 404,
// wrong content). Times out rather than hanging the form.
export function probeImage(url: string, timeoutMs = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const src = (url ?? "").trim();
    if (!src) {
      resolve(false);
      return;
    }
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    const img = new Image();
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
  });
}

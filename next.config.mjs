// Build armor: next-auth crashes EVERY prerendered page with a cryptic
// "TypeError: Invalid URL, input: ''" when NEXTAUTH_URL is set-but-empty
// (empty string is NOT nullish, so next-auth never falls back to VERCEL_URL).
// Default to the canonical domain so the build always succeeds; the real
// production URL + secret must still be set in Vercel env vars for auth
// callbacks/sessions to work at runtime.
const CANONICAL_URL = "https://phonelaptops.co.ke";
const rawUrl = process.env.NEXTAUTH_URL;
if (!rawUrl || rawUrl.includes("SENSITIVE")) {
  // Also catches Vercel CLI "[SENSITIVE]" placeholders from `vercel env pull`.
  console.warn(
    `[phonelaptops] NEXTAUTH_URL is missing, empty or a placeholder — defaulting to ${CANONICAL_URL} for this build. ` +
      `Set the real production URL in Vercel → Settings → Environment Variables.`
  );
  process.env.NEXTAUTH_URL = CANONICAL_URL;
}
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "[phonelaptops] WARNING: NEXTAUTH_SECRET is not set — /api/auth/* and admin login will fail at runtime. " +
      "Set a long random string in Vercel env vars."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: { typedRoutes: false },
  async redirects() {
    return [
      // Legacy slug: smartphones/* → phones/*
      { source: "/smartphones/:path*", destination: "/phones/:path*", permanent: true },
    ];
  },
};
export default nextConfig;

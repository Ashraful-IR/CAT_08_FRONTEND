/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Doctor avatars come from i.ibb.co (seed data, DECISIONS D-001), but
    // review authors' photoURL is user-provided at sign-up and can be any
    // https host — so the allow-list is intentionally broad (DECISIONS → Log,
    // task 3.1).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // No /api rewrite proxy: as of DECISIONS D-014 the browser calls the backend
  // DIRECTLY via NEXT_PUBLIC_API_URL (credentials: 'include'). The proxy used
  // to strand Better Auth's OAuth state + session cookies on this origin —
  // Google's callback then failed with ?error=state_mismatch. Do not re-add an
  // /api/:path* rewrite for browser traffic; Server Components call the
  // backend server-side via serverFetch (BACKEND_URL).

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

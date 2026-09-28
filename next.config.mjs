/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

const nextConfig = {
  reactStrictMode: true,

  // Same-origin API proxy: the browser never talks to the backend directly.
  // Keeps the httpOnly auth cookie first-party and avoids CORS entirely.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },

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

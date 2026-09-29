const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5002";

/**
 * robots (roadmap 5.2): index the public site, keep the API proxy and the
 * authenticated areas out of search results.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/appointments", "/profile"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5002";

/**
 * Static sitemap (roadmap 5.2). Only public, indexable routes — the
 * appointment/profile areas are behind auth and excluded from crawlers.
 *
 * @returns {Array<{ url: string, lastModified?: string, changeFrequency?: string, priority?: number }>}
 */
export default function sitemap() {
  const lastModified = new Date().toISOString();
  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/doctors`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}

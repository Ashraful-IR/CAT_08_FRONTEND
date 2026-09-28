import { request } from "./request";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

/**
 * Fetch for Server Components: calls the backend directly (no browser cookie
 * involved) using the server-only BACKEND_URL, with Next.js caching options.
 * Public data only — authenticated calls happen in the browser via client.js
 * so the httpOnly cookie flows (ARCHITECTURE → API proxy).
 *
 * @param {string} path - backend path beginning with /api/…
 * @param {{ schema?: import("zod").ZodTypeAny, revalidate?: number, tags?: string[], signal?: AbortSignal }} [options]
 */
export async function serverFetch(path, options = {}) {
  const { revalidate = 60, tags, schema, signal } = options;
  const { data } = await request(`${BACKEND_URL}${path}`, {
    method: "GET",
    signal,
    next: { revalidate, ...(tags ? { tags } : {}) },
  });
  return schema ? schema.parse(data) : data;
}

import { request, messageFrom } from "./request";

/**
 * The one configurable 401 hook. The session layer (roadmap task 1.1)
 * registers a handler that clears the query cache and redirects to
 * /login?next=<path> (API_CONTRACT → Status-code handling). Any 401 from
 * the sign-in endpoint bypasses the hook by passing `skip401Hook`.
 */
let handle401 = null;

/** Registers the global 401 handler. Idempotent; last registration wins. */
export function setUnauthorizedHandler(handler) {
  handle401 = typeof handler === "function" ? handler : null;
}

function run401Hook() {
  if (handle401) handle401();
}

/**
 * Browser base URL for backend calls (DECISIONS D-014, resolves B-009:
 * Better Auth sets the OAuth state + session cookies on the BACKEND origin —
 * `SameSite=None; Secure; Partitioned` — which is what the round trip needs.
 * Proxying the first hop through this app stranded the state cookie on the
 * frontend origin and Google's callback failed with `?error=state_mismatch`.
 * The backend's CORS allowlist + cross-site cookie config were built for the
 * direct model. Unset (tests, tooling) ⇒ relative URLs, so the MSW handlers
 * keep matching unchanged.
 *
 * @param {string} path - backend path beginning with /api/…
 * @returns {string}
 */
function apiUrl(path) {
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${path}`;
}

export const api = {
  /**
   * @template {import("zod").ZodTypeAny} [S=undefined]
   * @param {string} url
   * @param {import("zod").S} [schema]
   * @param {{ signal?: AbortSignal, skip401Hook?: boolean }} [options]
   */
  async get(url, schema, options = {}) {
    const { data } = await request(apiUrl(url), { method: "GET", signal: options.signal }, {
      on401: options.skip401Hook ? undefined : run401Hook,
    });
    return schema ? schema.parse(data) : data;
  },

  /**
   * @param {string} url
   * @param {unknown} body
   * @param {{ schema?: import("zod").ZodTypeAny, skip401Hook?: boolean }} [options]
   */
  async post(url, body, options = {}) {
    const { status, data } = await request(
      apiUrl(url),
      { method: "POST", body: JSON.stringify(body ?? {}) },
      { on401: options.skip401Hook ? undefined : run401Hook },
    );
    return options.schema ? options.schema.parse(data) : data ?? { status };
  },

  /**
   * @param {string} url
   * @param {unknown} body
   * @param {{ schema?: import("zod").ZodTypeAny }} [options]
   */
  async patch(url, body, options = {}) {
    const { data } = await request(apiUrl(url), { method: "PATCH", body: JSON.stringify(body ?? {}) }, {
      on401: run401Hook,
    });
    return options.schema ? options.schema.parse(data) : data;
  },

  /**
   * @param {string} url
   * @param {{ schema?: import("zod").ZodTypeAny }} [options]
   */
  async delete(url, options = {}) {
    const { data } = await request(apiUrl(url), { method: "DELETE" }, { on401: run401Hook });
    return options.schema ? options.schema.parse(data) : data;
  },
};

export { messageFrom };

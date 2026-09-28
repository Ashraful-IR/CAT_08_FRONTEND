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

export const api = {
  /**
   * @template {import("zod").ZodTypeAny} [S=undefined]
   * @param {string} url
   * @param {import("zod").S} [schema]
   * @param {{ signal?: AbortSignal, skip401Hook?: boolean }} [options]
   */
  async get(url, schema, options = {}) {
    const { data } = await request(url, { method: "GET", signal: options.signal }, {
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
      url,
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
    const { data } = await request(url, { method: "PATCH", body: JSON.stringify(body ?? {}) }, {
      on401: run401Hook,
    });
    return options.schema ? options.schema.parse(data) : data;
  },

  /**
   * @param {string} url
   * @param {{ schema?: import("zod").ZodTypeAny }} [options]
   */
  async delete(url, options = {}) {
    const { data } = await request(url, { method: "DELETE" }, { on401: run401Hook });
    return options.schema ? options.schema.parse(data) : data;
  },
};

export { messageFrom };

import { ApiError } from "./errors";

/**
 * Shared request core used by both the browser client (client.js) and
 * Server Components (server.js). Sends `credentials: 'include'` so the
 * httpOnly auth cookie flows through the same-origin /api proxy, parses
 * JSON, and throws ApiError for every non-2xx (API_CONTRACT).
 *
 * @param {string} url - absolute or relative URL
 * @param {RequestInit} [options]
 * @param {{ on401?: (response: Response) => void }} [hooks]
 *   on401 lets the session layer clear caches + redirect. It runs instead of
 *   throwing for 401 responses; when absent, a 401 throws like any other error.
 * @returns {Promise<{status: number, data: unknown, response: Response}>}
 */
export async function request(url, options = {}, hooks = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    // Network failure / DNS / aborted — not a backend status.
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  let data = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON body on an error status (e.g. an HTML error page from a proxy).
        if (!response.ok) {
          throw new ApiError(response.status, "Unexpected server response");
        }
        data = text;
      }
    }
  }

  if (response.status === 401 && hooks.on401) {
    // Global side-effects first (clear session cache, redirect to login),
    // then still throw below so the calling query/mutation observes the failure
    // and no component renders against a dead session.
    hooks.on401(response);
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return { status: response.status, data, response };
}

/**
 * Extracts the `{ message }` body from a JSON response, or a fallback.
 *
 * @param {unknown} data
 * @param {string} fallback
 * @returns {string}
 */
export function messageFrom(data, fallback = "Request failed") {
  if (data && typeof data === "object" && typeof data.message === "string") {
    return data.message;
  }
  return fallback;
}

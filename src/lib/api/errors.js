/**
 * Standard error thrown by the API layer for every non-2xx response.
 * Mirrors API_CONTRACT.md: errors are always `{ message: string }`.
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - human-readable message (from the backend when available)
   */
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Normalises anything thrown into a user-presentable message.
 * Never exposes stack traces or raw error objects (CODING_STANDARDS).
 *
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

/**
 * Validates a `?next=` redirect target (SECURITY_AND_AUTH → Route protection):
 * must be a relative path starting with a single "/" — no scheme, no "//"
 * protocol-relative URLs, no backslashes. Anything else falls back to "/".
 *
 * @param {string | null | undefined} next
 * @returns {string}
 */
export function safeNextPath(next) {
  if (typeof next !== "string" || next.length === 0) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  return next;
}

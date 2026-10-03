/**
 * Browser-navigation boundary for the OAuth round trip: the consent URL
 * points at Google (a different site), so the sign-out of SPA state must be
 * a full page load — `window.location.assign`, never router.push. Kept as
 * its own module because jsdom's Location object is unforgeable; component
 * tests mock this module the same way they mock next/navigation.
 *
 * @param {string} url - absolute provider consent URL from the backend
 */
export function redirectToExternal(url) {
  window.location.assign(url);
}

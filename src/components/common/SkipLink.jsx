/**
 * Skip link (CODING_STANDARDS → Accessibility): first focusable element on
 * every page; jumps keyboard/screen-reader users past the navbar to the
 * main landmark. Visually hidden until focused.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-label-lg focus:text-on-primary"
    >
      Skip to content
    </a>
  );
}

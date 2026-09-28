/**
 * Brand mark per design/docappoint_brand_logo (inline SVG, D-005 icons rule).
 * `Doc` in slate, `Appoint` in brand teal.
 */
export function Logo() {
  return (
    <svg
      viewBox="0 0 180 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DocAppoint"
      className="h-8 w-auto"
    >
      <rect width="40" height="40" rx="10" fill="#00685f" />
      <path d="M20 12V28M12 20H28" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="26" cy="14" r="3" fill="#6bd8cb" />
      <text
        x="48"
        y="27"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight="700"
        fontSize="20"
        fill="#131b2e"
        letterSpacing="-0.5"
      >
        Doc
        <tspan fill="#00685f">Appoint</tspan>
      </text>
    </svg>
  );
}

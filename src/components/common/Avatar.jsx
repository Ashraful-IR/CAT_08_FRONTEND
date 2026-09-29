import Image from "next/image";

/**
 * Only lets well-formed https URLs through to next/image — user-supplied
 * photoURLs can be partially typed (live preview) or malicious
 * (SECURITY_AND_AUTH → Input & output safety). Anything else falls back to
 * initials.
 *
 * @param {string | null | undefined} src
 * @returns {string | null}
 */
function safeHttpsUrl(src) {
  if (typeof src !== "string" || src.length === 0) {
    return null;
  }
  try {
    const url = new URL(src);
    return url.protocol === "https:" ? src : null;
  } catch {
    return null;
  }
}

/**
 * Circular avatar: photo when available, initials fallback otherwise
 * (DESIGN_SYSTEM → Content rules: names as returned by the API; initials
 * skip dotted honorifics like "Dr.").
 *
 * @param {{
 *   name: string,
 *   src?: string | null,
 *   className?: string,
 *   textClassName?: string,
 * }} props
 */
export function Avatar({ name, src, className = "size-12", textClassName = "text-label-lg" }) {
  const initials = name
    .split(" ")
    .filter((word) => word.length > 0 && !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const photo = safeHttpsUrl(src);

  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={48}
        height={48}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} ${textClassName} flex shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container`}
    >
      {initials}
    </div>
  );
}

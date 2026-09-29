import Image from "next/image";

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

  if (src) {
    return (
      <Image
        src={src}
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

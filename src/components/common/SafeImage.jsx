"use client";

import { Component } from "react";
import Image from "next/image";

/**
 * next/image wrapper that degrades gracefully: if the remote image fails to
 * load (the backend's seed photoURLs are dead — DECISIONS B-007), it swaps to
 * the caller's fallback instead of leaving a broken image. Class component
 * because image error state is per-instance and cannot live in a pure
 * function component (Avatar/DoctorCard render conditionally on data alone).
 *
 * @param {{
 *   src: string,
 *   alt: string,
 *   width?: number,
 *   height?: number,
 *   className?: string,
 *   priority?: boolean,
 *   fallback: React.ReactNode,
 * }} props
 */
export class SafeImage extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  render() {
    const {
      src,
      alt,
      width = 48,
      height = 48,
      className,
      priority = false,
      fallback,
    } = this.props;

    if (this.state.failed) {
      return fallback;
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        onError={() => this.setState({ failed: true })}
      />
    );
  }
}

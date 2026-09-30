import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeImage } from "./SafeImage";

describe("SafeImage", () => {
  it("renders the next/image when the source is healthy", () => {
    render(
      <SafeImage
        src="https://i.ibb.co.com/live.jpg"
        alt="Dr. Healthy"
        width={64}
        height={64}
        fallback={<span>FB</span>}
      />,
    );

    expect(screen.getByRole("img", { name: "Dr. Healthy" })).toBeInTheDocument();
    expect(screen.queryByText("FB")).not.toBeInTheDocument();
  });

  it("swaps to the fallback when the image fails to load (dead photoURL)", () => {
    render(
      <SafeImage
        src="https://i.ibb.co.com/dead-link.jpg"
        alt="Dr. Dead"
        width={64}
        height={64}
        fallback={<span>DD</span>}
      />,
    );

    // jsdom never fetches resources, so fire the error the browser would.
    fireEvent.error(screen.getByRole("img", { name: "Dr. Dead" }));

    expect(screen.getByText("DD")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Dr. Dead" })).not.toBeInTheDocument();
  });

  it("keeps the image interactive-free fallback accessible (aria-hidden)", () => {
    render(
      <SafeImage
        src="https://i.ibb.co.com/dead-link.jpg"
        alt="Dr. Hidden"
        width={48}
        height={48}
        fallback={<span aria-hidden="true">DH</span>}
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Dr. Hidden" }));

    // The fallback carries no accessible name; the surrounding markup owns it.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

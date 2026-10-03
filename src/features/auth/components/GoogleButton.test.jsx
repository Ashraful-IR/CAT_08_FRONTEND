import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { GoogleButton } from "./GoogleButton";
import { server } from "@/mocks/node";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Navigation happens as a full page load (window.location.assign behind the
// redirect boundary) — mocked like next/navigation in the form tests, since
// jsdom's Location is unforgeable.
const { redirectToExternalMock } = vi.hoisted(() => ({
  redirectToExternalMock: vi.fn(),
}));
vi.mock("../redirect", () => ({ redirectToExternal: redirectToExternalMock }));

const CONSENT_URL =
  "https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&state=mock";

describe("GoogleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an outline 'Continue with Google' button", () => {
    render(<GoogleButton />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("POSTs {provider, callbackURL} per contract and redirects to the returned consent url", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/auth/sign-in/social", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ url: CONSENT_URL });
      }),
    );

    render(<GoogleButton callbackPath="/appointments" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => expect(receivedBody).not.toBeNull());
    expect(receivedBody).toEqual({
      provider: "google",
      callbackURL: `${window.location.origin}/appointments`,
    });
    await waitFor(() =>
      expect(redirectToExternalMock).toHaveBeenCalledWith(CONSENT_URL),
    );
  });

  it("sanitises an unsafe callbackPath through safeNextPath", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/auth/sign-in/social", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ url: CONSENT_URL });
      }),
    );

    render(<GoogleButton callbackPath="https://evil.example.com/phish" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() =>
      expect(receivedBody).toEqual({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      }),
    );
  });

  it("toasts the backend message and stays put when the endpoint fails", async () => {
    server.use(
      http.post("/api/auth/sign-in/social", () =>
        HttpResponse.json(
          { message: "Social provider google is not configured" },
          { status: 500 },
        ),
      ),
    );

    render(<GoogleButton />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Social provider google is not configured",
      ),
    );
    expect(redirectToExternalMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /continue with google/i }),
      ).toBeEnabled(),
    );
  });

  it("disables itself and announces the redirect while the request is pending", async () => {
    server.use(
      http.post("/api/auth/sign-in/social", async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({ url: CONSENT_URL });
      }),
    );

    render(<GoogleButton />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();
    await waitFor(() => expect(redirectToExternalMock).toHaveBeenCalled());
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<GoogleButton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

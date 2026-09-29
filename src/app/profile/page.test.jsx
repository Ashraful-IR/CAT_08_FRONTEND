import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { sessionResponseFixture } from "@/mocks/fixtures";
import { Providers } from "@/app/providers";
import ProfilePage, { generateMetadata } from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  server.use(
    http.get("/api/auth/session", () =>
      HttpResponse.json(sessionResponseFixture),
    ),
  );
});

function renderPage(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>{ui}</Providers>
    </QueryClientProvider>,
  );
}

describe("/profile page", () => {
  it("titles the page and renders the update form", async () => {
    renderPage(await ProfilePage());

    expect(
      screen.getByRole("heading", { level: 1, name: /your profile/i }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo url/i)).toBeInTheDocument();
  });

  it("exposes SEO metadata", async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toContain("Profile");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderPage(await ProfilePage());

    await screen.findByLabelText(/full name/i);
    expect(await axe(container)).toHaveNoViolations();
  });
});

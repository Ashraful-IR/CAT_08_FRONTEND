import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { Navbar } from "./Navbar";
import { server } from "@/mocks/node";
import { sessionResponseFixture } from "@/mocks/fixtures";

// UserMenu's sign-out hook uses useRouter; provide a stub router.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Navbar", () => {
  it("renders logo, announcement banner, and the main links", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DocAppoint home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Doctors" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Appointments" })).toBeInTheDocument();
    expect(screen.getByText(/100% verified physician credentials/i)).toBeInTheDocument();
  });

  it("shows a skeleton while the session is loading", async () => {
    server.use(
      http.get("/api/auth/session", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(sessionResponseFixture);
      }),
    );
    renderWithProviders(<Navbar />);
    expect(screen.getByTestId("navbar-auth-skeleton")).toBeInTheDocument();
  });

  it("shows Sign in / Register when signed out", async () => {
    server.use(
      http.get("/api/auth/session", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );
    renderWithProviders(<Navbar />);
    expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("shows the signed-in user's name when a session exists", async () => {
    // Default handler is signed-out; sign-in flows override per TDD conventions.
    server.use(
      http.get("/api/auth/session", () => HttpResponse.json(sessionResponseFixture)),
    );
    renderWithProviders(<Navbar />);
    expect(await screen.findByText(sessionResponseFixture.user.name)).toBeInTheDocument();
  });
});

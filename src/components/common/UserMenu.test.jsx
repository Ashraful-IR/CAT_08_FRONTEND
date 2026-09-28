import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { toast } from "sonner";
import { UserMenu } from "./UserMenu";
import { server } from "@/mocks/node";
import { userFixture } from "@/mocks/fixtures";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

function renderMenu() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <UserMenu user={userFixture} />
    </QueryClientProvider>,
  );
}

describe("UserMenu", () => {
  it("opens from the account trigger and shows the user's email", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(await screen.findByText(userFixture.email)).toBeInTheDocument();
  });

  it("links to Profile and My appointments", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: /account menu/i }));

    expect(await screen.findByRole("menuitem", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByRole("menuitem", { name: /my appointments/i })).toHaveAttribute(
      "href",
      "/appointments",
    );
  });

  it("signs out: calls the endpoint, clears session, and toasts success", async () => {
    let signOutCalled = false;
    server.use(
      http.post("/api/auth/sign-out", () => {
        signOutCalled = true;
        return HttpResponse.json({ message: "Signed out" });
      }),
    );

    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(await screen.findByRole("menuitem", { name: /sign out/i }));

    await waitFor(() => expect(signOutCalled).toBe(true));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Signed out"));
  });

  it("toasts the backend message when sign-out fails", async () => {
    server.use(
      http.post("/api/auth/sign-out", () =>
        HttpResponse.json({ message: "Sign-out failed" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(await screen.findByRole("menuitem", { name: /sign out/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Sign-out failed"));
  });
});

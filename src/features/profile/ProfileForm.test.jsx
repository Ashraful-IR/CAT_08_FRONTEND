import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { toast } from "sonner";
import { server } from "@/mocks/node";
import { sessionResponseFixture, userFixture } from "@/mocks/fixtures";
import { Providers } from "@/app/providers";
import { ProfileForm } from "./ProfileForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// The form reads the session for prefilled values.
beforeEach(() => {
  server.use(
    http.get("/api/auth/session", () =>
      HttpResponse.json(sessionResponseFixture),
    ),
  );
});

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>
        <ProfileForm />
      </Providers>
    </QueryClientProvider>,
  );
}

describe("ProfileForm", () => {
  it("prefills name and photo URL from the session", async () => {
    renderForm();

    expect(
      await screen.findByLabelText(/full name/i),
    ).toHaveValue("Rifat Hossain");
    expect(screen.getByLabelText(/photo url/i)).toHaveValue(
      "https://randomuser.me/api/portraits/men/32.jpg",
    );
  });

  it("requires at least 2 characters in the name", async () => {
    const user = userEvent.setup();
    renderForm();

    const name = await screen.findByLabelText(/full name/i);
    await user.clear(name);
    await user.type(name, "R");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText(/name must be at least 2 characters/i),
    ).toBeInTheDocument();
  });

  it("rejects a non-https photo URL", async () => {
    const user = userEvent.setup();
    renderForm();

    const photo = await screen.findByLabelText(/photo url/i);
    await user.clear(photo);
    await user.type(photo, "http://example.com/me.jpg");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText(/must start with https:\/\//i),
    ).toBeInTheDocument();
  });

  it("submits changes and toasts success", async () => {
    server.use(
      http.patch("/api/users/:email", () =>
        HttpResponse.json({
          message: "Profile updated",
          user: { ...userFixture, name: "Rifat H. New" },
        }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    const name = await screen.findByLabelText(/full name/i);
    await user.clear(name);
    await user.type(name, "Rifat H. New");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("disables the submit button while pending", async () => {
    server.use(
      http.patch("/api/users/:email", async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({
          message: "Profile updated",
          user: userFixture,
        });
      }),
    );

    const user = userEvent.setup();
    renderForm();

    const name = await screen.findByLabelText(/full name/i);
    await user.clear(name);
    await user.type(name, "Rifat H. New");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      screen.getByRole("button", { name: /saving/i }),
    ).toBeDisabled();
  });

  it("shows the backend error when the update fails", async () => {
    server.use(
      http.patch("/api/users/:email", () =>
        HttpResponse.json({ message: "Nothing to update" }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    const name = await screen.findByLabelText(/full name/i);
    await user.clear(name);
    await user.type(name, "Rifat H. New");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /nothing to update/i,
    );
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderForm();
    await screen.findByLabelText(/full name/i);
    expect(await axe(container)).toHaveNoViolations();
  });
});

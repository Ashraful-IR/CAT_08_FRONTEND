import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { server } from "@/mocks/node";
import { sessionResponseFixture } from "@/mocks/fixtures";

const { replaceMock, searchParamsMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsMock: { current: new URLSearchParams() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsMock.current,
}));

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

async function fillAndSubmit({ email = "rifat@example.com", password = "Secret1" } = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  return user;
}

describe("LoginForm", () => {
  it("shows inline errors for empty fields without calling the API", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
  });

  it("disables the submit button while signing in", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({ message: "ok", user: sessionResponseFixture.user });
      }),
    );

    renderForm();
    await fillAndSubmit();

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeEnabled(),
    );
  });

  it("renders the backend's 401 message inline (bad credentials)", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "Invalid email or password" }, { status: 401 }),
      ),
    );

    renderForm();
    await fillAndSubmit({ password: "wrong" });

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("redirects to the validated next param after success", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "ok", user: sessionResponseFixture.user }),
      ),
    );
    searchParamsMock.current = new URLSearchParams("next=/appointments");

    renderForm();
    await fillAndSubmit();

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/appointments"));
    searchParamsMock.current = new URLSearchParams();
  });

  it("falls back to '/' when no next param is present", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "ok", user: sessionResponseFixture.user }),
      ),
    );

    renderForm();
    await fillAndSubmit();

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
  });
});

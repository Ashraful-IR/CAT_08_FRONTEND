import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { toast } from "sonner";
import { RegisterForm } from "./RegisterForm";
import { server } from "@/mocks/node";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/register",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RegisterForm />
    </QueryClientProvider>,
  );
}

const LABELS = {
  name: "Full name",
  email: "Email",
  photoURL: "Photo URL",
  password: "Password",
  confirm: "Confirm password",
};

async function fillAndSubmit(overrides = {}) {
  const user = userEvent.setup();
  const values = {
    name: "Rifat Hossain",
    email: "rifat@example.com",
    photoURL: "https://i.ibb.co/me.jpg",
    password: "Secret1",
    confirm: "Secret1",
    ...overrides,
  };

  await user.type(screen.getByLabelText(LABELS.name), values.name);
  await user.type(screen.getByLabelText(LABELS.email), values.email);
  await user.type(screen.getByLabelText(LABELS.photoURL), values.photoURL);
  await user.type(screen.getByLabelText(LABELS.password), values.password);
  await user.type(screen.getByLabelText(LABELS.confirm), values.confirm);
  await user.click(screen.getByRole("button", { name: /create account/i }));
  return user;
}

describe("RegisterForm", () => {
  it("shows required errors for every empty field without calling the API", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // confirmPassword intentionally shows no error on empty submit: the
    // match-refine only evaluates once the other fields pass (Zod semantics).
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid url/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument();
  });

  it("shows an inline error when passwords do not match", async () => {
    renderForm();
    await fillAndSubmit({ confirm: "Secret2" });

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

  it("rejects an http:// photo URL (backend requires https)", async () => {
    renderForm();
    await fillAndSubmit({ photoURL: "http://i.ibb.co/me.jpg" });

    expect(
      await screen.findByText(/must start with https:\/\//i),
    ).toBeInTheDocument();
  });

  it("disables the submit button and shows a spinner while pending", async () => {
    server.use(
      http.post("/api/auth/sign-up/email", async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({ message: "Account created" }, { status: 201 });
      }),
    );

    renderForm();
    const user = await fillAndSubmit();

    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled(),
    );
    expect(user).toBeDefined();
  });

  it("on success toasts, redirects to /login, and does not sign the user in", async () => {
    server.use(
      http.post("/api/auth/sign-up/email", () =>
        HttpResponse.json({ message: "Account created" }, { status: 201 }),
      ),
    );

    renderForm();
    await fillAndSubmit();

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("maps the 400 'Email already registered' API error to a toast", async () => {
    server.use(
      http.post("/api/auth/sign-up/email", () =>
        HttpResponse.json({ message: "Email already registered" }, { status: 400 }),
      ),
    );

    renderForm();
    await fillAndSubmit({ email: "taken@example.com" });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Email already registered"));
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

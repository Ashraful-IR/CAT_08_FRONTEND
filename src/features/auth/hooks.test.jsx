import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { useSession, useSignOut, useSignUp, useSignIn } from "./hooks";
import { server } from "@/mocks/node";
import { sessionResponseFixture } from "@/mocks/fixtures";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));
const navigationMock = vi.hoisted(() => ({
  usePathname: () => "/register",
  useSearchParams: () => new URLSearchParams("next=/doctors/abc"),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: navigationMock.usePathname,
  useSearchParams: navigationMock.useSearchParams,
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe("useSession", () => {
  it("exposes the user when a session exists", async () => {
    server.use(
      http.get("/api/auth/session", () => HttpResponse.json(sessionResponseFixture)),
    );
    const { result } = renderHook(() => useSession(), createWrapper());
    await waitFor(() => expect(result.current.user).not.toBeNull());
    expect(result.current.user.name).toBe(sessionResponseFixture.user.name);
  });

  it("reports signed-out (null user) on 401", async () => {
    const { result } = renderHook(() => useSession(), createWrapper());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });
});

describe("useSignOut", () => {
  it("calls the endpoint, clears the session cache, and redirects home", async () => {
    server.use(
      http.post("/api/auth/sign-out", () => HttpResponse.json({ message: "Signed out" })),
    );

    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(["session"], sessionResponseFixture);
    expect(queryClient.getQueryData(["session"])).toBeTruthy();

    const { result } = renderHook(() => useSignOut(), { wrapper });
    await act(async () => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replaceMock).toHaveBeenCalledWith("/");
    expect(queryClient.getQueryData(["session"])).toBeUndefined();
  });
});

describe("useSignUp", () => {
  it("POSTs the payload, redirects to /login, and does not sign the user in", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/auth/sign-up/email", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(
          { message: "Account created", user: { id: "u9" } },
          { status: 201 },
        );
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSignUp(), { wrapper });

    const values = {
      name: "Rifat Hossain",
      email: "rifat@example.com",
      photoURL: "https://i.ibb.co/me.jpg",
      password: "Secret1",
      confirmPassword: "Secret1",
    };

    await act(async () => result.current.mutate(values));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedBody).toEqual(values);
    // Sign-up must NOT log the user in, and the return target survives the
    // register→login hop (task 3.4: book → register → login → back to book).
    expect(replaceMock).toHaveBeenCalledWith("/login?next=%2Fdoctors%2Fabc");
  });

  it("surfaces the backend message on 400 (e.g. email already registered)", async () => {
    server.use(
      http.post("/api/auth/sign-up/email", () =>
        HttpResponse.json({ message: "Email already registered" }, { status: 400 }),
      ),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSignUp(), { wrapper });
    await act(async () =>
      result.current.mutate({
        name: "R H",
        email: "taken@example.com",
        photoURL: "https://i.ibb.co/me.jpg",
        password: "Secret1",
        confirmPassword: "Secret1",
      }),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("Email already registered");
  });
});

describe("useSignIn", () => {
  it("POSTs credentials and invalidates the session cache on success", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "ok", token: "ignored", user: sessionResponseFixture.user }),
      ),
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSignIn(), { wrapper });
    await act(async () => result.current.mutate({ email: "a@b.com", password: "Secret1" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["session"] });
  });

  it("propagates the 401 message without firing the global 401 hook", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "Invalid email or password" }, { status: 401 }),
      ),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSignIn(), { wrapper });
    await act(async () => result.current.mutate({ email: "a@b.com", password: "wrong" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("Invalid email or password");
  });
});

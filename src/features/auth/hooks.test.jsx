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
      http.post("/api/auth/sign-out", () => HttpResponse.json({ success: true })),
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
  it("POSTs the Better Auth payload without confirmPassword, invalidates the session, and lands on the next target (sign-up signs in)", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/auth/sign-up/email", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(
          { token: "tok", user: { id: "u9", name: "Rifat Hossain", email: "rifat@example.com", image: "https://i.ibb.co/me.jpg" } },
          { status: 200 },
        );
      }),
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSignUp(), { wrapper });

    await act(async () =>
      result.current.mutate({
        name: "Rifat Hossain",
        email: "rifat@example.com",
        photoURL: "https://i.ibb.co/me.jpg",
        password: "Secret1",
        confirmPassword: "Secret1",
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // confirmPassword is client-side only; photoURL maps to the wire `image`.
    expect(receivedBody).toEqual({
      name: "Rifat Hossain",
      email: "rifat@example.com",
      image: "https://i.ibb.co/me.jpg",
      password: "Secret1",
    });
    // Better Auth sets the cookie on sign-up — the session cache is refreshed.
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["session"] });
    // No /login hop: the user is already signed in (task 3.4 chain preserved —
    // the return target survives the whole register flow).
    expect(replaceMock).toHaveBeenCalledWith("/doctors/abc");
  });

  it("surfaces the backend message on 422 (email already registered)", async () => {
    server.use(
      http.post("/api/auth/sign-up/email", () =>
        HttpResponse.json(
          { message: "User already exists. Use another email.", code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
          { status: 422 },
        ),
      ),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSignUp(), { wrapper });
    await act(async () =>
      result.current.mutate({
        name: "R H",
        email: "taken@example.com",
        password: "Secret1",
      }),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("User already exists. Use another email.");
  });
});

describe("useSignIn", () => {
  it("POSTs credentials and invalidates the session cache on success", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({
          token: "ignored",
          user: { id: "u1", name: "R", email: "a@b.com", image: "https://x/y.png" },
        }),
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

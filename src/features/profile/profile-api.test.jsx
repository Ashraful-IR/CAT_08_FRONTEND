import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { userFixture } from "@/mocks/fixtures";
import { updateProfile } from "./api";
import { useUpdateProfile } from "./hooks";

describe("updateProfile", () => {
  it("PATCHes the URL-encoded email with only the given fields", async () => {
    let receivedPath = "";
    let receivedBody = null;
    server.use(
      http.patch("/api/users/:email", async ({ request }) => {
        receivedPath = new URL(request.url).pathname;
        receivedBody = await request.json();
        return HttpResponse.json({
          message: "Profile updated",
          user: { ...userFixture, name: "Rifat H. New" },
        });
      }),
    );

    await updateProfile(userFixture.email, { name: "Rifat H. New" });

    expect(receivedPath).toBe(
      `/api/users/${encodeURIComponent(userFixture.email)}`,
    );
    expect(receivedBody).toEqual({ name: "Rifat H. New" });
  });

  it("propagates documented errors (400 nothing to update, 403 other user)", async () => {
    server.use(
      http.patch("/api/users/:email", () =>
        HttpResponse.json({ message: "Nothing to update" }, { status: 400 }),
      ),
    );

    await expect(
      updateProfile(userFixture.email, { name: "X" }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe("useUpdateProfile", () => {
  it("writes the returned user into the session cache on success", async () => {
    server.use(
      http.patch("/api/users/:email", () =>
        HttpResponse.json({
          message: "Profile updated",
          user: { ...userFixture, name: "Rifat H. New" },
        }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(["session"], { user: userFixture });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });
    await act(async () => {
      result.current.mutate({
        email: userFixture.email,
        name: "Rifat H. New",
        photoURL: userFixture.photoURL,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const session = queryClient.getQueryData(["session"]);
    expect(session.user.name).toBe("Rifat H. New");
  });
});

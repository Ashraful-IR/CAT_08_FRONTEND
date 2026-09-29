import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { reviewFixtures } from "@/mocks/fixtures";
import { createReview } from "./api";
import { useCreateReview } from "./hooks";

const reviewBody = {
  doctorId: "6a51ea90108e8a8b1caaf768",
  appointmentId: "6a51ea90108e8a8b1cab3001",
  rating: 5,
  comment: "Wonderful care, everything explained clearly.",
};

const createdReview = {
  _id: "6a51ea90108e8a8b1cab0009",
  ...reviewBody,
  userEmail: "rifat@example.com",
  userName: "Rifat Hossain",
  userPhotoURL: "https://i.ibb.co/avatar-rifat.jpg",
  createdAt: "2026-09-28T12:00:00.000Z",
};

describe("createReview", () => {
  it("POSTs the review body and validates the response", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/reviews", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(createdReview, { status: 201 });
      }),
    );

    const review = await createReview(reviewBody);

    expect(receivedBody).toEqual(reviewBody);
    expect(review.comment).toBe(reviewBody.comment);
  });

  it("propagates documented 400s (already reviewed, rating range)", async () => {
    server.use(
      http.post("/api/reviews", () =>
        HttpResponse.json({ message: "Already reviewed" }, { status: 400 }),
      ),
    );

    await expect(createReview(reviewBody)).rejects.toMatchObject({
      status: 400,
    });
  });

  it("throws a descriptive error on malformed responses", async () => {
    server.use(
      http.post("/api/reviews", () =>
        HttpResponse.json({ nope: true }, { status: 201 }),
      ),
    );

    await expect(createReview(reviewBody)).rejects.toThrow(
      /unexpected review data/i,
    );
  });
});

describe("useCreateReview", () => {
  function createWrapper() {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { queryClient, wrapper };
  }

  it("refreshes the doctor's reviews on success", async () => {
    server.use(
      http.post("/api/reviews", () =>
        HttpResponse.json(createdReview, { status: 201 }),
      ),
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateReview(), { wrapper });

    await act(async () => {
      result.current.mutate(reviewBody);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["reviews", reviewBody.doctorId] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["doctor", reviewBody.doctorId] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["doctors"] });
  });
});

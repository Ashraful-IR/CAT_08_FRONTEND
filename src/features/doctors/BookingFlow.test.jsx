import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { BookingFlow } from "./BookingFlow";
import { doctorFixtures } from "@/mocks/fixtures";

const h = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  usePathname: () => "/doctors/x",
  useSearchParams: () => new URLSearchParams(),
}));

const doctor = doctorFixtures[0];

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
  h.push.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BookingFlow doctor={doctor} />
    </QueryClientProvider>,
  );
}

async function pickSlotAndFill(user) {
  await user.click(screen.getByRole("radio", { name: "10:30 AM" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.type(await screen.findByLabelText("Patient name"), "Rifat Hossain");
  await user.click(screen.getByRole("radio", { name: "Male" }));
  await user.type(screen.getByLabelText(/phone/i), "01712345678");
  await user.click(screen.getByRole("button", { name: /confirm booking/i }));
}

describe("BookingFlow", () => {
  it("swaps the picker for the form after a slot is picked", async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(screen.getByRole("radio", { name: "10:30 AM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByLabelText("Patient name")).toBeInTheDocument();
  });

  it("returns to slot picking when the backend reports 409", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderFlow();
    await pickSlotAndFill(user);

    // The conflict surfaces as a notice above the returned picker.
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/doctor is already booked at this slot/i);
    expect(screen.getByRole("tab", { name: /today/i })).toBeInTheDocument();
  });

  it("navigates to /appointments after a successful booking", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          {
            _id: "x9",
            id: "x9",
            userEmail: "rifat@example.com",
            doctorId: doctor._id,
            doctorName: doctor.name,
            fee: doctor.fee,
            rating: doctor.rating,
            patientName: "Rifat Hossain",
            gender: "Male",
            phone: "01712345678",
            appointmentDate: "2026-09-28",
            appointmentTime: "10:30 AM",
            createdAt: "2026-09-28T10:05:00.000Z",
          },
          { status: 201 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderFlow();
    await pickSlotAndFill(user);

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /^done$/i }),
    );
    expect(h.push).toHaveBeenCalledWith("/appointments");
  });
});

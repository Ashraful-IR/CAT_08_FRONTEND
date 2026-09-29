import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { Providers } from "@/app/providers";
import { BookingFlow } from "./BookingFlow";
import { doctorFixtures, sessionResponseFixture } from "@/mocks/fixtures";

const h = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, replace: h.replace }),
  usePathname: () => `/doctors/${doctorFixtures[0]._id}`,
  useSearchParams: () => new URLSearchParams(),
}));

const doctor = doctorFixtures[0];
const PROFILE_PATH = `/doctors/${doctor._id}`;

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
  h.push.mockClear();
  h.replace.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

/** The booking gate consults the session; most tests run signed in. */
function signedIn() {
  server.use(
    http.get("/api/auth/session", () =>
      HttpResponse.json(sessionResponseFixture),
    ),
  );
}

function renderFlow() {
  return render(
    <Providers>
      <BookingFlow doctor={doctor} />
    </Providers>,
  );
}

async function pickSlotAndFill(user) {
  // The session query must resolve (gate → picker) before interacting.
  await screen.findByRole("radio", { name: "10:30 AM" });
  await user.click(screen.getByRole("radio", { name: "10:30 AM" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.type(await screen.findByLabelText("Patient name"), "Rifat Hossain");
  await user.click(screen.getByRole("radio", { name: "Male" }));
  await user.type(screen.getByLabelText(/phone/i), "01712345678");
  await user.click(screen.getByRole("button", { name: /confirm booking/i }));
}

describe("BookingFlow sign-in gate (task 3.4)", () => {
  it("asks signed-out visitors to sign in instead of showing the booking form", async () => {
    renderFlow(); // default MSW session handler responds 401

    expect(
      await screen.findByRole("heading", { name: /sign in to book/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "09:00 AM" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the consultation fee visible to signed-out visitors", async () => {
    renderFlow();

    expect(await screen.findByText("৳1,300")).toBeInTheDocument();
  });

  it("links the gate back to this profile via ?next=", async () => {
    renderFlow();

    const link = await screen.findByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(PROFILE_PATH)}`,
    );
  });

  it("offers account creation to first-time visitors", async () => {
    renderFlow();

    // The register link carries the return path so the booking flow resumes
    // after register → login (task 3.4).
    const link = await screen.findByRole("link", { name: /create an account/i });
    expect(link).toHaveAttribute(
      "href",
      `/register?next=${encodeURIComponent(PROFILE_PATH)}`,
    );
  });

  it("shows the slot picker to signed-in users", async () => {
    signedIn();
    renderFlow();

    expect(
      await screen.findByRole("radio", { name: "09:00 AM" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /sign in to book/i }),
    ).not.toBeInTheDocument();
  });

  it("redirects to /login?next=<profile> when the booking POST returns 401", async () => {
    signedIn();
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );
    // The handler reads the real browser location, so mirror the profile URL.
    window.history.pushState({}, "", PROFILE_PATH);

    const user = userEvent.setup();
    renderFlow();
    await pickSlotAndFill(user);

    // Global 401 handler (Providers) sends the user to login with a return
    // path so signing in resumes the flow from this profile.
    await waitFor(() =>
      expect(h.replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent(PROFILE_PATH)}`,
      ),
    );
  });

  it("has no axe accessibility violations while signed out", async () => {
    const { container } = renderFlow();

    await screen.findByRole("heading", { name: /sign in to book/i });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BookingFlow booking journey", () => {
  it("swaps the picker for the form after a slot is picked", async () => {
    signedIn();
    const user = userEvent.setup();
    renderFlow();

    await screen.findByRole("radio", { name: "09:00 AM" });
    await user.click(screen.getByRole("radio", { name: "10:30 AM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByLabelText("Patient name")).toBeInTheDocument();
  });

  it("returns to slot picking when the backend reports 409", async () => {
    signedIn();
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
    signedIn();
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

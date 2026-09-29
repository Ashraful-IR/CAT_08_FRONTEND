import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { Providers } from "@/app/providers";
import { AppointmentsBrowser } from "./AppointmentsBrowser";
import { myAppointmentFixtures } from "@/mocks/fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}));

// Frozen clock: 2026-09-28 → fixture 1 (2026-09-30) is upcoming, fixture 2
// (2026-09-20) is past.
beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderBrowser() {
  return render(
    <Providers>
      <AppointmentsBrowser doctorsById={{}} />
    </Providers>,
  );
}

describe("AppointmentsBrowser", () => {
  it("shows Upcoming and Past tabs with counts", async () => {
    renderBrowser();

    const tablist = await screen.findByRole("tablist", { name: /appointments/i });
    expect(tablist).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /upcoming/i })).toHaveTextContent("1");
    expect(screen.getByRole("tab", { name: /past/i })).toHaveTextContent("1");
  });

  it("lists the upcoming appointment first", async () => {
    renderBrowser();

    const panel = await screen.findByRole("tabpanel", {
      name: /upcoming appointments/i,
    });
    expect(within(panel).getByText("Dr. Fatema Begum")).toBeInTheDocument();
    expect(
      screen.queryByRole("tabpanel", { name: /past appointments/i }),
    ).not.toBeInTheDocument();
  });

  it("switches to the Past tab and back", async () => {
    const user = userEvent.setup();
    renderBrowser();

    await user.click(await screen.findByRole("tab", { name: /past/i }));
    const panel = screen.getByRole("tabpanel", {
      name: /past appointments/i,
    });
    expect(within(panel).getByText("Dr. Karim Uddin")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /upcoming/i }));
    expect(
      screen.getByRole("tabpanel", { name: /upcoming appointments/i }),
    ).toBeInTheDocument();
  });

  it("switches tabs with arrow keys (ARIA tabs pattern)", async () => {
    const user = userEvent.setup();
    renderBrowser();

    const upcomingTab = await screen.findByRole("tab", { name: /upcoming/i });
    upcomingTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: /past/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("shows an empty state when a tab has no appointments", async () => {
    server.use(
      http.get("/api/appointments/mine", () => HttpResponse.json([])),
    );

    const user = userEvent.setup();
    renderBrowser();

    expect(
      await screen.findByText(/no upcoming appointments/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /past/i }));
    expect(screen.getByText(/no past appointments/i)).toBeInTheDocument();
  });

  it("links the empty state to doctor discovery", async () => {
    server.use(
      http.get("/api/appointments/mine", () => HttpResponse.json([])),
    );

    renderBrowser();

    const link = await screen.findByRole("link", { name: /find a doctor/i });
    expect(link).toHaveAttribute("href", "/doctors");
  });

  it("shows an error state with retry when the request fails", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    renderBrowser();

    expect(
      await screen.findByText(/couldn't load your appointments/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("recovers via the retry button", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderBrowser();
    await screen.findByText(/couldn't load your appointments/i);

    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json(myAppointmentFixtures),
      ),
    );
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("Dr. Fatema Begum")).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderBrowser();
    await screen.findByRole("tab", { name: /upcoming/i });
    expect(await axe(container)).toHaveNoViolations();
  });
});

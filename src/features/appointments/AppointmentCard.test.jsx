import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { AppointmentCard } from "./AppointmentCard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

/** Shape mirrors myAppointmentFixtures; doctor joined by the page. */
function appointment(overrides = {}) {
  return {
    _id: "6a51ea90108e8a8b1cab3001",
    userEmail: "rifat@example.com",
    doctorId: "6a51ea90108e8a8b1caaf768",
    doctorName: "Dr. Fatema Begum",
    fee: 1300,
    rating: 4.9,
    patientName: "Rifat Hossain",
    gender: "Male",
    phone: "01712345678",
    appointmentDate: "2026-09-30",
    appointmentTime: "10:00 AM",
    createdAt: "2026-09-27T09:30:00.000Z",
    ...overrides,
  };
}

const doctor = {
  _id: "6a51ea90108e8a8b1caaf768",
  name: "Dr. Fatema Begum",
  specialty: "Gynecologist",
  fee: 1300,
  rating: 4.9,
  photoURL: "https://i.ibb.co/dr-fatema.jpg",
  description: "Expert in women's reproductive health and prenatal care.",
};

describe("AppointmentCard — upcoming", () => {
  it("shows doctor name, specialty, and the booked slot", () => {
    render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );

    expect(screen.getByText("Dr. Fatema Begum")).toBeInTheDocument();
    expect(screen.getByText("Gynecologist")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30 · 10:00 AM")).toBeInTheDocument();
  });

  it("shows the consultation fee", () => {
    render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );

    expect(screen.getByText("৳1,300")).toBeInTheDocument();
  });

  it("shows the relative-day badge", () => {
    render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );

    expect(screen.getByText("In 2 Days")).toBeInTheDocument();
  });

  it("shows the patient details the booking was made for", () => {
    render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );

    expect(screen.getByText("Rifat Hossain")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("01712345678")).toBeInTheDocument();
  });

  it("renders doctor identity as a link to the profile", () => {
    render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );

    const link = screen.getByRole("link", { name: /dr\. fatema begum/i });
    expect(link).toHaveAttribute("href", `/doctors/${doctor._id}`);
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(
      <AppointmentCard
        appointment={appointment()}
        doctor={doctor}
        relativeDay="In 2 Days"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("AppointmentCard — past", () => {
  it("shows a past badge instead of the countdown", () => {
    render(
      <AppointmentCard
        appointment={appointment({
          appointmentDate: "2026-09-20",
          appointmentTime: "09:00 AM",
        })}
        doctor={doctor}
        relativeDay="8 Days Ago"
      />,
    );

    expect(screen.getByText("8 Days Ago")).toBeInTheDocument();
  });
});

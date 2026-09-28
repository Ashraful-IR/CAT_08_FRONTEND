import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DoctorCard } from "./DoctorCard";
import { doctorFixtures } from "@/mocks/fixtures";

const doctor = doctorFixtures[0];

describe("DoctorCard", () => {
  it("renders name, specialty, rating, and fee as a link to the profile", () => {
    render(<DoctorCard doctor={doctor} />);

    const link = screen.getByRole("link", { name: /Dr. Fatema Begum/ });
    expect(link).toHaveAttribute("href", `/doctors/${doctor._id}`);
    expect(screen.getByText("Gynecologist")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("৳1,300")).toBeInTheDocument();
  });

  it("renders a verified badge on the avatar", () => {
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByRole("img", { name: doctor.name })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /verified/i })).toBeInTheDocument();
  });

  it("shows a fallback when the doctor has no photo", () => {
    render(<DoctorCard doctor={{ ...doctor, photoURL: "" }} />);
    expect(screen.getByText("FB")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: doctor.name }),
    ).not.toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<DoctorCard doctor={doctor} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

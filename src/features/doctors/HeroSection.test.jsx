import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { axe } from "jest-axe";
import { HeroSection } from "./HeroSection";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const specialties = ["Gynecologist", "Dermatologist", "Cardiologist"];

describe("HeroSection", () => {
  it("renders the display heading with the teal accent span", () => {
    render(<HeroSection specialties={specialties} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Find the right doctor");
    expect(screen.getByText("for your care.")).toBeInTheDocument();
  });

  it("renders the specialties from the doctor data as select options", () => {
    render(<HeroSection specialties={specialties} />);
    const specialtySelect = screen.getByLabelText("Specialty");
    expect(specialtySelect).toHaveValue("all");
    expect(screen.getByRole("option", { name: "All Specialties" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gynecologist" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cardiologist" })).toBeInTheDocument();
  });

  it("navigates to /doctors with the entered query and specialty", async () => {
    const push = vi.fn();
    useRouter.mockReturnValue({ push });
    const user = userEvent.setup();
    render(<HeroSection specialties={specialties} />);

    await user.type(screen.getByLabelText("Search"), "heart");
    await user.selectOptions(screen.getByLabelText("Specialty"), "Cardiologist");
    await user.click(screen.getByRole("button", { name: /find a doctor/i }));

    expect(push).toHaveBeenCalledWith("/doctors?q=heart&specialty=Cardiologist");
  });

  it("navigates with no params when the form is left at defaults", async () => {
    const push = vi.fn();
    useRouter.mockReturnValue({ push });
    const user = userEvent.setup();
    render(<HeroSection specialties={specialties} />);

    await user.click(screen.getByRole("button", { name: /find a doctor/i }));

    expect(push).toHaveBeenCalledWith("/doctors");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<HeroSection specialties={specialties} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

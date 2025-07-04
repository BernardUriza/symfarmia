import { render, screen } from "@testing-library/react";
import HomePage from "../app/page";
import TestProviders from "./utils/TestProviders";

describe("HomePage", () => {
  it("renders the CinematicLandingPage component", () => {
    render(
      <TestProviders>
        <HomePage />
      </TestProviders>,
    );
    expect(
      screen.getByText("The Future of Medicine Is Here"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("SYMFARMIA").length).toBeGreaterThan(0);
  });

  it("contains the main SYMFARMIA branding", () => {
    render(
      <TestProviders>
        <HomePage />
      </TestProviders>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The Future of Medicine Is Here",
    );
  });

  it("displays the platform description", () => {
    render(
      <TestProviders>
        <HomePage />
      </TestProviders>,
    );
    expect(
      screen.getByText(
        "Liberate 70% of your time, restore hope to your medical practice",
      ),
    ).toBeInTheDocument();
  });
});

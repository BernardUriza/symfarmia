import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "../src/pages/LandingPage";
import TestProviders from "./utils/TestProviders";

// Mock window.alert
window.alert = jest.fn();

describe("LandingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the main heading", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(screen.getByText("Welcome to")).toBeInTheDocument();
    expect(screen.getAllByText("SYMFARMIA").length).toBeGreaterThan(0);
  });

  it("renders the subtitle", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(
      screen.getByText("Intelligent platform for independent doctors"),
    ).toBeInTheDocument();
  });

  it("renders Login and Register buttons", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("renders Try Demo Mode button", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: /try demo mode/i }),
    ).toBeInTheDocument();
  });

  it("opens the demo modal when Try Demo Mode is clicked", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    const demoButton = screen.getByRole("button", { name: /try demo mode/i });
    fireEvent.click(demoButton);
    expect(screen.getByText("Demo Login")).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(screen.getByText("Patient Management")).toBeInTheDocument();
    expect(screen.getByText("Medical Reports")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("has correct Login link href", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute(
      "href",
      "/api/auth/login?returnTo=/legacy",
    );
  });

  it("has correct Register link href", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toHaveAttribute(
      "href",
      "/api/auth/login?returnTo=/legacy",
    );
  });

  it("renders footer copyright", () => {
    render(
      <TestProviders>
        <LandingPage />
      </TestProviders>,
    );
    expect(screen.getByText(/© 2024 SYMFARMIA/)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingState from "./LoadingState";

describe("LoadingState", () => {
  it("renders the cooking emoji", () => {
    render(<LoadingState />);
    expect(screen.getByText("🍳")).toBeInTheDocument();
  });

  it("has the correct accessibility attributes", () => {
    render(<LoadingState />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("shows streaming text when provided", () => {
    render(<LoadingState streamingText='{"title": "Test"}' />);
    expect(screen.getByText('{"title": "Test"}')).toBeInTheDocument();
  });

  it("does not show the streaming block when streamingText is empty", () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector("pre")).toBeNull();
  });
});

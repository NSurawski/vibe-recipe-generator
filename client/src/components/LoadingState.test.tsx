import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingState from "./LoadingState";

const noop = () => {};

describe("LoadingState", () => {
  it("renders the loading text", () => {
    render(<LoadingState onBack={noop} />);
    expect(screen.getByText("Crafting your recipe...")).toBeInTheDocument();
    expect(screen.getByText(/Claude is cooking/)).toBeInTheDocument();
  });

  it("has the correct accessibility attributes", () => {
    render(<LoadingState onBack={noop} />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("shows streaming text when provided", () => {
    render(<LoadingState onBack={noop} streamingText='{"title": "Test"}' />);
    expect(screen.getByText('{"title": "Test"}')).toBeInTheDocument();
  });

  it("shows skeleton placeholders when no streaming text", () => {
    const { container } = render(<LoadingState onBack={noop} />);
    expect(container.querySelector("pre")).toBeNull();
  });
});

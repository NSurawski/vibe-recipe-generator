import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VibeInput from "./VibeInput";

describe("VibeInput — default vibe mode", () => {
  it("renders the vibe text input by default", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Describe a mood/)).toBeInTheDocument();
  });

  it("renders quick vibes section", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    expect(screen.getByText("QUICK VIBES")).toBeInTheDocument();
  });

  it("renders preferences section", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    expect(screen.getByText("PREFERENCES")).toBeInTheDocument();
  });

  it("submit button is disabled when vibe is empty", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    expect(screen.getByText("+ Generate My Recipe")).toBeDisabled();
  });

  it("submit button enables when vibe is entered", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Describe a mood/), { target: { value: "cozy" } });
    expect(screen.getByText("+ Generate My Recipe")).not.toBeDisabled();
  });

  it("calls onSubmit with trimmed vibe value and preferences", () => {
    const onSubmit = vi.fn();
    render(<VibeInput onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/Describe a mood/), { target: { value: "  cozy rainy day  " } });
    fireEvent.click(screen.getByText("+ Generate My Recipe"));
    expect(onSubmit).toHaveBeenCalledWith("cozy rainy day", expect.objectContaining({ diet: [], time: "", skill: "" }));
  });
});

describe("VibeInput — ingredient mode", () => {
  it("switches to ingredient mode when 'Use what I have' is clicked", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Use what I have"));
    expect(screen.getByPlaceholderText(/tomatoes, pasta/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Describe a mood/)).not.toBeInTheDocument();
  });

  it("hides quick vibes in ingredient mode", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Use what I have"));
    expect(screen.queryByText("QUICK VIBES")).not.toBeInTheDocument();
  });

  it("switches back to vibe mode when 'Describe a vibe' is clicked", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Use what I have"));
    fireEvent.click(screen.getByText("Describe a vibe"));
    expect(screen.getByPlaceholderText(/Describe a mood/)).toBeInTheDocument();
  });

  it("submit button is disabled when ingredients are empty", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Use what I have"));
    expect(screen.getByText("Make Something With This")).toBeDisabled();
  });

  it("calls onSubmit with ingredient prompt when ingredients are submitted", () => {
    const onSubmit = vi.fn();
    render(<VibeInput onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText("Use what I have"));
    fireEvent.change(screen.getByPlaceholderText(/tomatoes, pasta/), { target: { value: "eggs, cheese" } });
    fireEvent.click(screen.getByText("Make Something With This"));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.stringContaining("eggs, cheese"),
      expect.any(Object)
    );
  });
});

describe("VibeInput — surprise me", () => {
  it("renders surprise me button in vibe mode", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    expect(screen.getByText("✨ Surprise me")).toBeInTheDocument();
  });

  it("calls onSubmit immediately when surprise me is clicked", () => {
    const onSubmit = vi.fn();
    render(<VibeInput onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText("✨ Surprise me"));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not require any input for surprise me", () => {
    const onSubmit = vi.fn();
    render(<VibeInput onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText("✨ Surprise me"));
    const [vibe] = onSubmit.mock.calls[0];
    expect(typeof vibe).toBe("string");
    expect(vibe.length).toBeGreaterThan(0);
  });
});

describe("VibeInput — character count", () => {
  it("does not show character count below 400 chars", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Describe a mood/), { target: { value: "short vibe" } });
    expect(screen.queryByText("490")).not.toBeInTheDocument();
  });

  it("shows remaining character count when approaching 500 char limit", () => {
    render(<VibeInput onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Describe a mood/), { target: { value: "a".repeat(410) } });
    expect(screen.getByText("90")).toBeInTheDocument();
  });
});

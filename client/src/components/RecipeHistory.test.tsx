import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecipeHistory from "./RecipeHistory";
import type { HistoryEntry } from "../hooks/useRecipeHistory";
import type { Recipe } from "../types";

const base: Recipe = {
  title: "Test Recipe",
  description: "desc",
  ingredients: [],
  steps: [],
  time: "5 min",
  difficulty: "Easy",
  servings: "2 servings",
  tags: [],
  vibe_notes: "",
};

let idCounter = 0;
function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: String(++idCounter),
    recipe: base,
    vibe: "cozy vibes",
    savedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("RecipeHistory — rendering", () => {
  it("renders recent entries with heading", () => {
    render(<RecipeHistory history={[makeEntry({ recipe: { ...base, title: "Pasta" } })]} onSelect={vi.fn()} />);
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.getByText("Recent")).toBeInTheDocument();
  });

  it("renders saved entries under Saved heading", () => {
    render(<RecipeHistory history={[makeEntry({ favorited: true, recipe: { ...base, title: "Pasta" } })]} onSelect={vi.fn()} />);
    expect(screen.getByText("★ Saved")).toBeInTheDocument();
    expect(screen.queryByText("Recent")).not.toBeInTheDocument();
  });

  it("renders both sections when there are saved and recent entries", () => {
    const history = [
      makeEntry({ favorited: true, recipe: { ...base, title: "Saved One" } }),
      makeEntry({ recipe: { ...base, title: "Recent One" } }),
    ];
    render(<RecipeHistory history={history} onSelect={vi.fn()} />);
    expect(screen.getByText("★ Saved")).toBeInTheDocument();
    expect(screen.getByText("Recent")).toBeInTheDocument();
  });

  it("calls onSelect with the entry when clicked", () => {
    const onSelect = vi.fn();
    const entry = makeEntry({ recipe: { ...base, title: "Pasta" } });
    render(<RecipeHistory history={[entry]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Pasta"));
    expect(onSelect).toHaveBeenCalledWith(entry);
  });

  it("shows star rating when entry has a rating", () => {
    render(<RecipeHistory history={[makeEntry({ rating: 3 })]} onSelect={vi.fn()} />);
    expect(screen.getByText("★★★")).toBeInTheDocument();
  });
});

describe("RecipeHistory — delete", () => {
  it("shows delete button when onDelete is provided", () => {
    render(<RecipeHistory history={[makeEntry()]} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByLabelText("Delete recipe")).toBeInTheDocument();
  });

  it("does not show delete button when onDelete is not provided", () => {
    render(<RecipeHistory history={[makeEntry()]} onSelect={vi.fn()} />);
    expect(screen.queryByLabelText("Delete recipe")).not.toBeInTheDocument();
  });

  it("calls onDelete with the entry id when × is clicked", () => {
    const onDelete = vi.fn();
    const entry = makeEntry({ id: "delete-me-123" });
    render(<RecipeHistory history={[entry]} onSelect={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Delete recipe"));
    expect(onDelete).toHaveBeenCalledWith("delete-me-123");
  });
});

describe("RecipeHistory — search", () => {
  const fourEntries = () => [
    makeEntry({ id: "s1", recipe: { ...base, title: "Spicy Pasta" }, vibe: "spicy" }),
    makeEntry({ id: "s2", recipe: { ...base, title: "Cozy Soup" }, vibe: "cozy" }),
    makeEntry({ id: "s3", recipe: { ...base, title: "Light Salad" }, vibe: "fresh" }),
    makeEntry({ id: "s4", recipe: { ...base, title: "Fancy Steak" }, vibe: "fancy" }),
  ];

  it("shows search input with 4+ entries", () => {
    render(<RecipeHistory history={fourEntries()} onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search recipes...")).toBeInTheDocument();
  });

  it("hides search input with fewer than 4 entries", () => {
    render(<RecipeHistory history={[makeEntry()]} onSelect={vi.fn()} />);
    expect(screen.queryByPlaceholderText("Search recipes...")).not.toBeInTheDocument();
  });

  it("filters by recipe title", () => {
    render(<RecipeHistory history={fourEntries()} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search recipes..."), { target: { value: "pasta" } });
    expect(screen.getByText("Spicy Pasta")).toBeInTheDocument();
    expect(screen.queryByText("Cozy Soup")).not.toBeInTheDocument();
  });

  it("filters by vibe text", () => {
    render(<RecipeHistory history={fourEntries()} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search recipes..."), { target: { value: "cozy" } });
    expect(screen.getByText("Cozy Soup")).toBeInTheDocument();
    expect(screen.queryByText("Spicy Pasta")).not.toBeInTheDocument();
  });

  it("shows no results message when search finds nothing", () => {
    render(<RecipeHistory history={fourEntries()} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search recipes..."), { target: { value: "zzz-no-match" } });
    expect(screen.getByText(/No recipes match/)).toBeInTheDocument();
  });
});

describe("RecipeHistory — collections", () => {
  it("shows collection label for favorited entries with a collection", () => {
    const history = [
      makeEntry({ favorited: true, collection: "Date Night", recipe: { ...base, title: "Fancy Steak" } }),
    ];
    render(<RecipeHistory history={history} onSelect={vi.fn()} />);
    expect(screen.getByText(/Date Night/)).toBeInTheDocument();
  });

  it("groups multiple saved entries by collection", () => {
    const history = [
      makeEntry({ favorited: true, collection: "Date Night", recipe: { ...base, title: "Steak" } }),
      makeEntry({ favorited: true, collection: "Weeknight", recipe: { ...base, title: "Pasta" } }),
    ];
    render(<RecipeHistory history={history} onSelect={vi.fn()} />);
    expect(screen.getByText(/Date Night/)).toBeInTheDocument();
    expect(screen.getByText(/Weeknight/)).toBeInTheDocument();
  });
});

describe("RecipeHistory — show more", () => {
  it("shows 'Show N more' button when section has more than 3 entries", () => {
    const history = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ id: String(i), recipe: { ...base, title: `Recipe ${i}` } })
    );
    render(<RecipeHistory history={history} onSelect={vi.fn()} />);
    expect(screen.getByText("Show 2 more")).toBeInTheDocument();
  });

  it("expands to show all entries when 'Show more' is clicked", () => {
    const history = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ id: String(i), recipe: { ...base, title: `Recipe ${i}` } })
    );
    render(<RecipeHistory history={history} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByText("Show 2 more"));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });
});

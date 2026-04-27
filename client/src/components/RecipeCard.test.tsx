import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecipeCard from "./RecipeCard";
import type { Recipe } from "../types";

const mockRecipe: Recipe = {
  title: "Chaos Pancakes",
  description: "A very chaotic brunch.",
  ingredients: [
    { item: "flour", amount: "1 cup" },
    { item: "eggs", amount: "2", note: "free range" },
  ],
  steps: ["Mix everything.", "Cook it."],
  time: "20 minutes",
  difficulty: "Easy",
  servings: "2 servings",
  tags: ["Chaotic", "Brunch"],
  vibe_notes: "Pure chaos, pure brunch.",
};

const noop = () => {};

describe("RecipeCard — content rendering", () => {
  it("renders recipe title and description", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText("Chaos Pancakes")).toBeInTheDocument();
    expect(screen.getByText("A very chaotic brunch.")).toBeInTheDocument();
  });

  it("renders all ingredients including optional notes", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText(/1 cup flour/)).toBeInTheDocument();
    expect(screen.getByText(/free range/)).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText("Mix everything.")).toBeInTheDocument();
    expect(screen.getByText("Cook it.")).toBeInTheDocument();
  });

  it("renders metadata", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText(/20 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText("Chaotic")).toBeInTheDocument();
    expect(screen.getByText("Brunch")).toBeInTheDocument();
  });
});

describe("RecipeCard — navigation", () => {
  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={onBack} onRegenerate={noop} />);
    fireEvent.click(screen.getByText("← Back"));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe("RecipeCard — regenerate confirmation", () => {
  it("shows confirmation dialog when 'Try a different take' is clicked", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    fireEvent.click(screen.getByText("Try a different take"));
    expect(screen.getByText("Lose this recipe?")).toBeInTheDocument();
    expect(screen.getByText("Yes, try again")).toBeInTheDocument();
    expect(screen.getByText("Keep it")).toBeInTheDocument();
  });

  it("calls onRegenerate after confirming", () => {
    const onRegenerate = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={onRegenerate} />);
    fireEvent.click(screen.getByText("Try a different take"));
    fireEvent.click(screen.getByText("Yes, try again"));
    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it("dismisses confirmation without regenerating when 'Keep it' is clicked", () => {
    const onRegenerate = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={onRegenerate} />);
    fireEvent.click(screen.getByText("Try a different take"));
    fireEvent.click(screen.getByText("Keep it"));
    expect(onRegenerate).not.toHaveBeenCalled();
    expect(screen.getByText("Try a different take")).toBeInTheDocument();
  });
});

describe("RecipeCard — serving scaler", () => {
  it("shows base serving count", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.getByText("2 servings")).toBeInTheDocument();
  });

  it("initializes from savedServings prop", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} savedServings={4} />);
    expect(screen.getByText("4 servings")).toBeInTheDocument();
  });

  it("increments serving count when + is clicked", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    fireEvent.click(screen.getByText("+"));
    expect(screen.getByText("3 servings")).toBeInTheDocument();
  });

  it("decrements serving count when − is clicked", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} savedServings={3} />);
    fireEvent.click(screen.getByText("−"));
    expect(screen.getByText("2 servings")).toBeInTheDocument();
  });

  it("does not go below 1 serving", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} savedServings={1} />);
    fireEvent.click(screen.getByText("−"));
    expect(screen.getByText("1 serving")).toBeInTheDocument();
  });

  it("calls onServingsChange when count changes", () => {
    const onServingsChange = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} onServingsChange={onServingsChange} />);
    fireEvent.click(screen.getByText("+"));
    expect(onServingsChange).toHaveBeenCalledWith(3);
  });
});

describe("RecipeCard — favorites", () => {
  it("does not render save button when onToggleFavorite is not provided", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.queryByText(/Save Recipe/)).not.toBeInTheDocument();
  });

  it("calls onToggleFavorite when save button is clicked", () => {
    const onToggleFavorite = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} isFavorited={false} onToggleFavorite={onToggleFavorite} />);
    fireEvent.click(screen.getByText("♥ Save Recipe"));
    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it("shows saved state when favorited", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} isFavorited={true} onToggleFavorite={noop} />);
    expect(screen.getByText("♥ Saved")).toBeInTheDocument();
  });
});

describe("RecipeCard — collections", () => {
  it("shows collection input when favorited and onCollectionChange provided", () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onBack={noop}
        onRegenerate={noop}
        isFavorited={true}
        onToggleFavorite={noop}
        onCollectionChange={noop}
      />
    );
    expect(screen.getByPlaceholderText(/Add to collection/)).toBeInTheDocument();
  });

  it("does not show collection input when not favorited", () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onBack={noop}
        onRegenerate={noop}
        isFavorited={false}
        onToggleFavorite={noop}
        onCollectionChange={noop}
      />
    );
    expect(screen.queryByPlaceholderText(/Add to collection/)).not.toBeInTheDocument();
  });

  it("calls onCollectionChange when collection name is typed", () => {
    const onCollectionChange = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        onBack={noop}
        onRegenerate={noop}
        isFavorited={true}
        onToggleFavorite={noop}
        onCollectionChange={onCollectionChange}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Add to collection/), { target: { value: "Date Night" } });
    expect(onCollectionChange).toHaveBeenCalledWith("Date Night");
  });
});

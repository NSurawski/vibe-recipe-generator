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

describe("RecipeCard", () => {
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

  it("calls onRegenerate when button is clicked", () => {
    const onRegenerate = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={onRegenerate} />);
    fireEvent.click(screen.getByText("Try a different take"));
    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onBack={onBack} onRegenerate={noop} />);
    fireEvent.click(screen.getByText("← Back"));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("does not render save button when onToggleFavorite is not provided", () => {
    render(<RecipeCard recipe={mockRecipe} onBack={noop} onRegenerate={noop} />);
    expect(screen.queryByText(/Save Recipe/)).not.toBeInTheDocument();
  });

  it("calls onToggleFavorite when save button is clicked", () => {
    const onToggleFavorite = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        onBack={noop}
        onRegenerate={noop}
        isFavorited={false}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.click(screen.getByText("♥ Save Recipe"));
    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it("shows saved state when favorited", () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onBack={noop}
        onRegenerate={noop}
        isFavorited={true}
        onToggleFavorite={noop}
      />
    );
    expect(screen.getByText("♥ Saved")).toBeInTheDocument();
  });
});

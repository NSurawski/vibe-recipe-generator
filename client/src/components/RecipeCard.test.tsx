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
  vibe_notes: "Pure chaos, pure brunch.",
};

describe("RecipeCard", () => {
  it("renders recipe title and description", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={false} />);
    expect(screen.getByText("Chaos Pancakes")).toBeInTheDocument();
    expect(screen.getByText("A very chaotic brunch.")).toBeInTheDocument();
  });

  it("renders all ingredients including optional notes", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={false} />);
    expect(screen.getByText("flour")).toBeInTheDocument();
    expect(screen.getByText(/free range/)).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={false} />);
    expect(screen.getByText("Mix everything.")).toBeInTheDocument();
    expect(screen.getByText("Cook it.")).toBeInTheDocument();
  });

  it("renders metadata badges", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={false} />);
    expect(screen.getByText("20 minutes")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("2 ingredients")).toBeInTheDocument();
  });

  it("calls onRegenerate when button is clicked", () => {
    const onRegenerate = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onRegenerate={onRegenerate} isLoading={false} />);
    fireEvent.click(screen.getByText("Try a different take"));
    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it("disables regenerate button while loading", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={true} />);
    expect(screen.getByRole("button", { name: /regenerating/i })).toBeDisabled();
  });

  it("does not render save button when onToggleFavorite is not provided", () => {
    render(<RecipeCard recipe={mockRecipe} onRegenerate={() => {}} isLoading={false} />);
    expect(screen.queryByText(/save recipe/i)).not.toBeInTheDocument();
  });

  it("calls onToggleFavorite when save button is clicked", () => {
    const onToggleFavorite = vi.fn();
    render(
      <RecipeCard
        recipe={mockRecipe}
        onRegenerate={() => {}}
        isLoading={false}
        isFavorited={false}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.click(screen.getByText("☆ Save recipe"));
    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it("shows saved state when favorited", () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onRegenerate={() => {}}
        isLoading={false}
        isFavorited={true}
        onToggleFavorite={() => {}}
      />
    );
    expect(screen.getByText("★ Saved")).toBeInTheDocument();
  });
});

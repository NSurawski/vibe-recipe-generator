import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, it, expect } from "vitest";
import { useRecipeHistory } from "./useRecipeHistory";
import type { Recipe } from "../types";

const mockRecipe: Recipe = {
  title: "Test Recipe",
  description: "Test desc",
  ingredients: [{ item: "water", amount: "1 cup" }],
  steps: ["Boil water"],
  time: "5 min",
  difficulty: "Easy",
  servings: "2 servings",
  tags: [],
  vibe_notes: "Hydrating",
};

beforeEach(() => {
  localStorage.clear();
});

describe("useRecipeHistory", () => {
  it("starts with empty history", () => {
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toHaveLength(0);
  });

  it("addToHistory adds an entry", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => { result.current.addToHistory(mockRecipe, "cozy vibes"); });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].recipe.title).toBe("Test Recipe");
    expect(result.current.history[0].vibe).toBe("cozy vibes");
  });

  it("addToHistory returns a non-empty id", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    expect(id!).toBeTruthy();
  });

  it("addToHistory prepends new entries", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => { result.current.addToHistory(mockRecipe, "first"); });
    act(() => { result.current.addToHistory({ ...mockRecipe, title: "Second" }, "second"); });
    expect(result.current.history[0].recipe.title).toBe("Second");
  });

  it("limits history to 10 entries", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToHistory({ ...mockRecipe, title: `Recipe ${i}` }, "vibe");
      }
    });
    expect(result.current.history).toHaveLength(10);
  });

  it("deleteEntry removes the correct entry", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.deleteEntry(id!); });
    expect(result.current.history).toHaveLength(0);
  });

  it("deleteEntry only removes the targeted entry", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id1: string, id2: string;
    act(() => {
      id1 = result.current.addToHistory(mockRecipe, "first");
      id2 = result.current.addToHistory({ ...mockRecipe, title: "Second" }, "second");
    });
    act(() => { result.current.deleteEntry(id1!); });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe(id2!);
  });

  it("toggleFavorite marks an entry as favorited", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.toggleFavorite(id!); });
    expect(result.current.history[0].favorited).toBe(true);
  });

  it("toggleFavorite unfavorites a favorited entry", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.toggleFavorite(id!); });
    act(() => { result.current.toggleFavorite(id!); });
    expect(result.current.history[0].favorited).toBe(false);
  });

  it("rateRecipe saves the rating", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.rateRecipe(id!, 4); });
    expect(result.current.history[0].rating).toBe(4);
  });

  it("updateNote saves the note text", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.updateNote(id!, "Added extra garlic"); });
    expect(result.current.history[0].note).toBe("Added extra garlic");
  });

  it("updateServings saves the serving count", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.updateServings(id!, 4); });
    expect(result.current.history[0].servings).toBe(4);
  });

  it("setCollection saves the collection name", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.setCollection(id!, "Date Night"); });
    expect(result.current.history[0].collection).toBe("Date Night");
  });

  it("setCollection with empty string removes the collection", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "cozy vibes"); });
    act(() => { result.current.setCollection(id!, "Date Night"); });
    act(() => { result.current.setCollection(id!, ""); });
    expect(result.current.history[0].collection).toBeUndefined();
  });

  it("persists entries to localStorage", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => { result.current.addToHistory(mockRecipe, "cozy vibes"); });
    const stored = JSON.parse(localStorage.getItem("vibe-recipe-history") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].recipe.title).toBe("Test Recipe");
  });

  it("loads persisted entries on mount", () => {
    const entry = {
      id: "test-123",
      recipe: mockRecipe,
      vibe: "cozy",
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("vibe-recipe-history", JSON.stringify([entry]));
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].recipe.title).toBe("Test Recipe");
  });

  it("returns empty history when localStorage contains corrupt JSON", () => {
    localStorage.setItem("vibe-recipe-history", "{not valid json");
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toHaveLength(0);
  });

  it("backfills missing IDs on legacy entries", () => {
    const legacy = {
      recipe: mockRecipe,
      vibe: "old",
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("vibe-recipe-history", JSON.stringify([legacy]));
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history[0].id).toBeTruthy();
  });

  it("toggleFavorite on an unknown id is a no-op", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => { result.current.addToHistory(mockRecipe, "vibe"); });
    const before = result.current.history[0].favorited;
    act(() => { result.current.toggleFavorite("does-not-exist"); });
    expect(result.current.history[0].favorited).toBe(before);
  });

  it("deleteEntry on an unknown id leaves history unchanged", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => { result.current.addToHistory(mockRecipe, "vibe"); });
    act(() => { result.current.deleteEntry("does-not-exist"); });
    expect(result.current.history).toHaveLength(1);
  });

  it("setCollection trims whitespace-only strings to undefined", () => {
    const { result } = renderHook(() => useRecipeHistory());
    let id: string;
    act(() => { id = result.current.addToHistory(mockRecipe, "vibe"); });
    act(() => { result.current.setCollection(id!, "   "); });
    expect(result.current.history[0].collection).toBeUndefined();
  });
});

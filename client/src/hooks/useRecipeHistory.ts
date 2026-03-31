import { useState } from "react";
import type { Recipe } from "../types";

const MAX_HISTORY = 10;
const STORAGE_KEY = "vibe-recipe-history";

export interface HistoryEntry {
  recipe: Recipe;
  vibe: string;
  savedAt: string;
}

export function useRecipeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const addToHistory = (recipe: Recipe, vibe: string) => {
    const entry: HistoryEntry = { recipe, vibe, savedAt: new Date().toISOString() };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { history, addToHistory };
}

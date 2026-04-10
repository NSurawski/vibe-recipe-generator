import { useState } from "react";
import type { Recipe } from "../types";

const MAX_HISTORY = 10;
const STORAGE_KEY = "vibe-recipe-history";

export interface HistoryEntry {
  id: string;
  recipe: Recipe;
  vibe: string;
  savedAt: string;
  favorited?: boolean;
  rating?: number;
}

function persist(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useRecipeHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const entries: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // Backfill IDs for entries saved before this change
      let migrated = false;
      for (const entry of entries) {
        if (!entry.id) {
          entry.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          migrated = true;
        }
      }
      if (migrated) persist(entries);
      return entries;
    } catch {
      return [];
    }
  });

  const addToHistory = (recipe: Recipe, vibe: string): string => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entry: HistoryEntry = { id, recipe, vibe, savedAt: new Date().toISOString() };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      persist(updated);
      return updated;
    });
    return id;
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, favorited: !e.favorited } : e
      );
      persist(updated);
      return updated;
    });
  };

  const rateRecipe = (id: string, rating: number) => {
    setHistory((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, rating } : e
      );
      persist(updated);
      return updated;
    });
  };

  return { history, addToHistory, toggleFavorite, rateRecipe };
}

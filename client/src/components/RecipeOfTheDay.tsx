import { useState } from "react";
import type { Recipe } from "../types";
import styles from "./RecipeOfTheDay.module.css";

interface Props {
  onSelect: (recipe: Recipe) => void;
  onGenerate: () => void;
}

export default function RecipeOfTheDay({ onSelect, onGenerate }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [todayRecipe] = useState<Recipe | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recipe-of-day") || "null");
      return stored?.date === today ? stored.recipe : null;
    } catch {
      return null;
    }
  });

  return (
    <div className={styles.container}>
      <p className={styles.label}>✨ TODAY'S PICK</p>
      {todayRecipe ? (
        <button className={styles.recipeBtn} onClick={() => onSelect(todayRecipe)}>
          {todayRecipe.title}
        </button>
      ) : (
        <button className={styles.generateBtn} onClick={onGenerate}>
          Generate today's recipe →
        </button>
      )}
    </div>
  );
}

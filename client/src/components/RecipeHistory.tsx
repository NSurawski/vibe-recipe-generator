import type { HistoryEntry } from "../hooks/useRecipeHistory";
import styles from "./RecipeHistory.module.css";

interface RecipeHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

export default function RecipeHistory({ history, onSelect }: RecipeHistoryProps) {
  return (
    <section className={styles.container}>
      <h3 className={styles.heading}>Recent Recipes</h3>
      <ul className={styles.list}>
        {history.map((entry, i) => (
          <li key={i}>
            <button className={styles.button} onClick={() => onSelect(entry)}>
              <span className={styles.recipeTitle}>{entry.recipe.title}</span>
              <span className={styles.vibe}>"{entry.vibe}"</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

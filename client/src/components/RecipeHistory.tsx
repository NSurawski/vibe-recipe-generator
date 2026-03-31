import type { HistoryEntry } from "../hooks/useRecipeHistory";
import styles from "./RecipeHistory.module.css";

interface RecipeHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

function EntryList({ entries, onSelect }: { entries: HistoryEntry[]; onSelect: (e: HistoryEntry) => void }) {
  return (
    <ul className={styles.list}>
      {entries.map((entry, i) => (
        <li key={i}>
          <button className={styles.button} onClick={() => onSelect(entry)}>
            <span className={styles.recipeTitle}>{entry.recipe.title}</span>
            <span className={styles.vibe}>"{entry.vibe}"</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function RecipeHistory({ history, onSelect }: RecipeHistoryProps) {
  const favorites = history.filter((e) => e.favorited);
  const recent = history.filter((e) => !e.favorited);

  return (
    <section className={styles.container}>
      {favorites.length > 0 && (
        <>
          <h3 className={styles.heading}>★ Saved</h3>
          <EntryList entries={favorites} onSelect={onSelect} />
          {recent.length > 0 && <div className={styles.divider} />}
        </>
      )}
      {recent.length > 0 && (
        <>
          <h3 className={styles.heading}>Recent</h3>
          <EntryList entries={recent} onSelect={onSelect} />
        </>
      )}
    </section>
  );
}

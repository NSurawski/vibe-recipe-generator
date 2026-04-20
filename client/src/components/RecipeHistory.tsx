import { useState } from "react";
import type { HistoryEntry } from "../hooks/useRecipeHistory";
import styles from "./RecipeHistory.module.css";

const INITIAL_LIMIT = 3;

interface RecipeHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

function EntryList({ entries, onSelect }: { entries: HistoryEntry[]; onSelect: (e: HistoryEntry) => void }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, INITIAL_LIMIT);
  const hidden = entries.length - INITIAL_LIMIT;

  return (
    <>
      <ul className={styles.list}>
        {visible.map((entry, i) => (
          <li key={i}>
            <button className={styles.button} onClick={() => onSelect(entry)}>
              <span className={styles.recipeTitle}>{entry.recipe.title}</span>
              <span className={styles.vibe}>"{entry.vibe}"</span>
              {entry.rating ? <span className={styles.stars}>{"★".repeat(entry.rating)}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {entries.length > INITIAL_LIMIT && (
        <button className={styles.showMore} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show ${hidden} more`}
        </button>
      )}
    </>
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

import { useState } from "react";
import type { HistoryEntry } from "../hooks/useRecipeHistory";
import styles from "./RecipeHistory.module.css";

const INITIAL_LIMIT = 3;
const SEARCH_THRESHOLD = 4;

interface RecipeHistoryProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete?: (id: string) => void;
}

function EntryList({
  entries,
  onSelect,
  onDelete,
}: {
  entries: HistoryEntry[];
  onSelect: (e: HistoryEntry) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, INITIAL_LIMIT);
  const hidden = entries.length - INITIAL_LIMIT;

  return (
    <>
      <ul className={styles.list}>
        {visible.map((entry, i) => (
          <li key={i} className={styles.item}>
            <button className={styles.button} onClick={() => onSelect(entry)}>
              <span className={styles.recipeTitle}>{entry.recipe.title}</span>
              <span className={styles.vibe}>"{entry.vibe}"</span>
              {entry.rating ? <span className={styles.stars}>{"★".repeat(entry.rating)}</span> : null}
            </button>
            {onDelete && (
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                aria-label="Delete recipe"
              >
                ×
              </button>
            )}
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

export default function RecipeHistory({ history, onSelect, onDelete }: RecipeHistoryProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? history.filter(
        (e) =>
          e.recipe.title.toLowerCase().includes(search.toLowerCase()) ||
          e.vibe.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  const favorites = filtered.filter((e) => e.favorited);
  const recent = filtered.filter((e) => !e.favorited);

  // Group favorites by collection
  const collections = new Map<string, HistoryEntry[]>();
  for (const entry of favorites) {
    const key = entry.collection?.trim() || "";
    if (!collections.has(key)) collections.set(key, []);
    collections.get(key)!.push(entry);
  }
  const collectionKeys = Array.from(collections.keys()).sort((a, b) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return a.localeCompare(b);
  });

  return (
    <section className={styles.container}>
      {history.length >= SEARCH_THRESHOLD && (
        <input
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          aria-label="Search recipes"
        />
      )}
      {favorites.length > 0 && (
        <>
          <h3 className={styles.heading}>★ Saved</h3>
          {collectionKeys.map((key) => (
            <div key={key} className={styles.collectionGroup}>
              {key && <p className={styles.collectionLabel}>📁 {key}</p>}
              <EntryList entries={collections.get(key)!} onSelect={onSelect} onDelete={onDelete} />
            </div>
          ))}
          {recent.length > 0 && <div className={styles.divider} />}
        </>
      )}
      {recent.length > 0 && (
        <>
          <h3 className={styles.heading}>Recent</h3>
          <EntryList entries={recent} onSelect={onSelect} onDelete={onDelete} />
        </>
      )}
      {filtered.length === 0 && search.trim() && (
        <p className={styles.noResults}>No recipes match "{search}"</p>
      )}
    </section>
  );
}

import { useState } from "react";
import type { HistoryEntry } from "../hooks/useRecipeHistory";
import styles from "./RecipeHistory.module.css";
import ShoppingListModal from "./ShoppingListModal";
import type { RecipeShoppingGroup } from "./ShoppingListModal";

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
  selecting,
  selectedIds,
  onToggleSelect,
}: {
  entries: HistoryEntry[];
  onSelect: (e: HistoryEntry) => void;
  onDelete?: (id: string) => void;
  selecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, INITIAL_LIMIT);
  const hidden = entries.length - INITIAL_LIMIT;

  return (
    <>
      <ul className={styles.list}>
        {visible.map((entry, i) => (
          <li key={i} className={styles.item}>
            {selecting && (
              <span
                className={`${styles.selectBox} ${selectedIds?.has(entry.id) ? styles.selectBoxChecked : ""}`}
                aria-hidden="true"
              >
                {selectedIds?.has(entry.id) ? "✓" : ""}
              </span>
            )}
            <button
              className={styles.button}
              onClick={() => selecting ? onToggleSelect?.(entry.id) : onSelect(entry)}
            >
              <span className={styles.recipeTitle}>{entry.recipe.title}</span>
              <span className={styles.vibe}>"{entry.vibe}"</span>
              {entry.rating ? <span className={styles.stars}>{"★".repeat(entry.rating)}</span> : null}
            </button>
            {!selecting && onDelete && (
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
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shoppingGroups, setShoppingGroups] = useState<RecipeShoppingGroup[] | null>(null);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function cancelSelect() {
    setSelecting(false);
    setSelectedIds(new Set());
  }

  function buildList() {
    const groups = history
      .filter((e) => selectedIds.has(e.id))
      .map((e) => ({
        title: e.recipe.title,
        ingredients: e.recipe.ingredients.map(
          (ing) => `${ing.amount} ${ing.item}${ing.note ? ` — ${ing.note}` : ""}`
        ),
      }));
    setShoppingGroups(groups);
  }

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

  const entryListProps = { selecting, selectedIds, onToggleSelect: toggleSelect };

  return (
    <section className={styles.container}>
      <div className={styles.topRow}>
        {history.length >= SEARCH_THRESHOLD && !selecting && (
          <input
            className={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            aria-label="Search recipes"
          />
        )}
        {selecting ? (
          <div className={styles.selectToolbar}>
            <button className={styles.cancelSelectBtn} onClick={cancelSelect}>Cancel</button>
            <span className={styles.selectCount}>
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Tap recipes to select"}
            </span>
            <button
              className={styles.buildListBtn}
              onClick={buildList}
              disabled={selectedIds.size === 0}
            >
              Build List
            </button>
          </div>
        ) : (
          <button className={styles.shoppingListToggle} onClick={() => setSelecting(true)}>
            + Shopping List
          </button>
        )}
      </div>

      {favorites.length > 0 && (
        <>
          <h3 className={styles.heading}>★ Saved</h3>
          {collectionKeys.map((key) => (
            <div key={key} className={styles.collectionGroup}>
              {key && <p className={styles.collectionLabel}>📁 {key}</p>}
              <EntryList entries={collections.get(key)!} onSelect={onSelect} onDelete={onDelete} {...entryListProps} />
            </div>
          ))}
          {recent.length > 0 && <div className={styles.divider} />}
        </>
      )}
      {recent.length > 0 && (
        <>
          <h3 className={styles.heading}>Recent</h3>
          <EntryList entries={recent} onSelect={onSelect} onDelete={onDelete} {...entryListProps} />
        </>
      )}
      {filtered.length === 0 && search.trim() && (
        <p className={styles.noResults}>No recipes match "{search}"</p>
      )}

      {shoppingGroups && (
        <ShoppingListModal groups={shoppingGroups} onClose={() => setShoppingGroups(null)} />
      )}
    </section>
  );
}

import { useState } from "react";
import styles from "./ShoppingListModal.module.css";

export interface RecipeShoppingGroup {
  title: string;
  ingredients: string[];
}

interface ShoppingListModalProps {
  groups: RecipeShoppingGroup[];
  onClose: () => void;
}

export default function ShoppingListModal({ groups, onClose }: ShoppingListModalProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function handleCopy() {
    const lines: string[] = [];
    if (groups.length === 1) {
      lines.push(`Shopping List — ${groups[0].title}`, "");
      groups[0].ingredients.forEach((ing) => lines.push(`• ${ing}`));
    } else {
      lines.push("Shopping List", "");
      groups.forEach((g) => {
        lines.push(g.title);
        g.ingredients.forEach((ing) => lines.push(`• ${ing}`));
        lines.push("");
      });
    }
    navigator.clipboard.writeText(lines.join("\n").trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const subtitle =
    groups.length === 1
      ? groups[0].title
      : `${groups.reduce((n, g) => n + g.ingredients.length, 0)} items across ${groups.length} recipes`;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Shopping list">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Shopping List</h3>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <ul className={styles.list}>
          {groups.map((group, gi) => (
            <li key={gi}>
              {groups.length > 1 && (
                <p className={styles.sectionHeader}>{group.title}</p>
              )}
              <ul className={styles.ingredientList}>
                {group.ingredients.map((ing, ii) => {
                  const key = `${gi}-${ii}`;
                  const isChecked = checked.has(key);
                  return (
                    <li
                      key={key}
                      className={`${styles.item} ${isChecked ? styles.itemChecked : ""}`}
                      onClick={() => toggle(key)}
                    >
                      <span className={styles.checkbox}>{isChecked ? "✓" : ""}</span>
                      <span className={styles.itemText}>{ing}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? "✓ Copied!" : "Copy List"}
        </button>
      </div>
    </div>
  );
}

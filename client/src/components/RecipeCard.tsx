import { useState } from "react";
import type { Recipe } from "../types";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: Recipe;
  onBack: () => void;
  onRegenerate: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  rating?: number;
  onRate?: (rating: number) => void;
  onShare?: () => void;
}

function scaleAmount(amount: string, multiplier: number): string {
  if (multiplier === 1) return amount;
  const mixedMatch = amount.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixedMatch) {
    const value = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    return formatScaled(value * multiplier) + amount.slice(mixedMatch[0].length);
  }
  const fractionMatch = amount.match(/^(\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const value = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    return formatScaled(value * multiplier) + amount.slice(fractionMatch[0].length);
  }
  const numberMatch = amount.match(/^(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const value = parseFloat(numberMatch[1]);
    return formatScaled(value * multiplier) + amount.slice(numberMatch[0].length);
  }
  return amount;
}

function formatScaled(n: number): string {
  const FRACTIONS: [number, string][] = [
    [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"],
    [1.25, "1¼"], [1.33, "1⅓"], [1.5, "1½"], [1.67, "1⅔"], [1.75, "1¾"],
    [2.25, "2¼"], [2.5, "2½"], [2.75, "2¾"], [3.5, "3½"],
  ];
  for (const [val, str] of FRACTIONS) {
    if (Math.abs(n - val) < 0.08) return str;
  }
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

function formatRecipeText(recipe: Recipe): string {
  const lines: string[] = [recipe.title];
  if (recipe.description) lines.push("", recipe.description);
  lines.push("", `${recipe.time} · ${recipe.difficulty}${recipe.servings ? ` · ${recipe.servings}` : ""}`);
  lines.push("", "INGREDIENTS");
  recipe.ingredients.forEach((ing) => {
    lines.push(`• ${ing.amount} ${ing.item}${ing.note ? ` — ${ing.note}` : ""}`);
  });
  lines.push("", "STEPS");
  recipe.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  if (recipe.vibe_notes) lines.push("", recipe.vibe_notes);
  return lines.join("\n");
}

export default function RecipeCard({
  recipe,
  onBack,
  onRegenerate,
  isFavorited = false,
  onToggleFavorite,
  rating = 0,
  onRate,
  onShare,
}: RecipeCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const baseServings = parseInt(recipe.servings) || 2;
  const [servings, setServings] = useState(baseServings);
  const multiplier = servings / baseServings;
  const [hoverRating, setHoverRating] = useState(0);

  function toggleIngredient(index: number) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(formatRecipeText(recipe)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      <button className={styles.back} onClick={onBack}>
        ← Back
      </button>
      <h2 className={styles.pageTitle}>Your Recipe</h2>

      <div className={styles.headerCard}>
        <h3 className={styles.title}>{recipe.title}</h3>
        {recipe.description && (
          <p className={styles.description}>{recipe.description}</p>
        )}
        <div className={styles.metaRow}>
          <p className={styles.meta}>
            {recipe.time} · {recipe.difficulty}
          </p>
          {recipe.servings && (
            <div className={styles.servingScaler}>
              <button className={styles.scalerBtn} onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
              <span className={styles.servingCount}>{servings} serving{servings !== 1 ? "s" : ""}</span>
              <button className={styles.scalerBtn} onClick={() => setServings((s) => s + 1)}>+</button>
            </div>
          )}
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className={styles.tags}>
            {recipe.tags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                <span className={styles.tagDot} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Ingredients</h4>
        <ul className={styles.ingredientList}>
          {recipe.ingredients.map((ing, i) => (
            <li
              key={i}
              className={`${styles.ingredient} ${checkedIngredients.has(i) ? styles.ingredientChecked : ""}`}
              onClick={() => toggleIngredient(i)}
            >
              <span className={styles.bullet} />
              {scaleAmount(ing.amount, multiplier)} {ing.item}
              {ing.note && <span className={styles.note}> — {ing.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Steps</h4>
        <ol className={styles.stepList}>
          {recipe.steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {recipe.vibe_notes && (
        <section className={styles.vibeNotes}>
          <p className={styles.vibeNotesText}>{recipe.vibe_notes}</p>
        </section>
      )}

      {onRate && (
        <div className={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starFilled : ""}`}
              onClick={() => onRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {onToggleFavorite && (
        <button
          className={`${styles.saveBtn} ${isFavorited ? styles.saveBtnActive : ""}`}
          onClick={onToggleFavorite}
        >
          {isFavorited ? "♥ Saved" : "♥ Save Recipe"}
        </button>
      )}

      <button className={styles.copyBtn} onClick={handleCopy}>
        {copied ? "✓ Copied!" : "Copy Recipe"}
      </button>

      {onShare && (
        <button
          className={styles.shareBtn}
          onClick={() => {
            onShare();
            setShared(true);
            setTimeout(() => setShared(false), 2000);
          }}
        >
          {shared ? "✓ Link Copied!" : "Share Recipe"}
        </button>
      )}

      <button className={styles.printBtn} onClick={() => window.print()}>
        Print Recipe
      </button>

      <button className={styles.regenerateBtn} onClick={onRegenerate}>
        Try a different take
      </button>
    </div>
  );
}

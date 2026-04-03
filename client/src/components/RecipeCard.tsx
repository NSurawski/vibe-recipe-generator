import type { Recipe } from "../types";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: Recipe;
  onBack: () => void;
  onRegenerate: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export default function RecipeCard({
  recipe,
  onBack,
  onRegenerate,
  isFavorited = false,
  onToggleFavorite,
}: RecipeCardProps) {
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
        <p className={styles.meta}>
          {recipe.time} · {recipe.difficulty}
          {recipe.servings ? ` · ${recipe.servings}` : ""}
        </p>
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
            <li key={i} className={styles.ingredient}>
              <span className={styles.bullet} />
              {ing.amount} {ing.item}
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

      {onToggleFavorite && (
        <button
          className={`${styles.saveBtn} ${isFavorited ? styles.saveBtnActive : ""}`}
          onClick={onToggleFavorite}
        >
          {isFavorited ? "♥ Saved" : "♥ Save Recipe"}
        </button>
      )}

      <button className={styles.regenerateBtn} onClick={onRegenerate}>
        Try a different take
      </button>
    </div>
  );
}

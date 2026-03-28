import type { Recipe } from "../types";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: Recipe;
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function RecipeCard({
  recipe,
  onRegenerate,
  isLoading,
}: RecipeCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{recipe.title}</h2>
        <p className={styles.description}>{recipe.description}</p>
      </header>

      <div className={styles.meta}>
        <span className={styles.badge}>{recipe.time}</span>
        <span className={styles.badge}>{recipe.difficulty}</span>
        <span className={styles.badge}>
          {recipe.ingredients.length} ingredients
        </span>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ingredients</h3>
        <ul className={styles.ingredientList}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className={styles.ingredient}>
              <span className={styles.ingredientAmount}>{ing.amount}</span>{" "}
              {ing.item}
              {ing.note && (
                <span className={styles.ingredientNote}> — {ing.note}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Steps</h3>
        <ol className={styles.stepList}>
          {recipe.steps.map((step, i) => (
            <li key={i} className={styles.step}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.vibeNotes}>{recipe.vibe_notes}</div>

      <div className={styles.actions}>
        <button
          className={styles.regenerateBtn}
          onClick={onRegenerate}
          disabled={isLoading}
        >
          {isLoading ? "Regenerating..." : "Try a different take"}
        </button>
      </div>
    </article>
  );
}

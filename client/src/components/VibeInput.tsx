import { useState, type FormEvent } from "react";
import type { Preferences } from "../types";
import styles from "./VibeInput.module.css";

interface VibeInputProps {
  onSubmit: (vibe: string, preferences: Preferences) => void;
}

const ALL_VIBES = [
  "Fancy dinner", "Light & fresh", "Spicy kick", "Date night",
  "Cozy rainy day", "Summer BBQ", "Midnight snack", "Lazy Sunday brunch",
  "Post-workout fuel", "Impress the in-laws", "Comfort food vibes",
  "Something adventurous", "5-ingredient challenge", "Girls' night in",
  "Hungover but hungry", "Treat yourself",
];

function pickRandom(arr: string[], n: number): string[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const QUICK_VIBES = pickRandom(ALL_VIBES, 4);
const DIET_OPTIONS = ["Vegetarian", "Vegan", "GF", "Dairy-free", "Nut-free", "Keto", "High-protein", "Low-carb"];
const TIME_OPTIONS = ["< 30 min", "30–60 min", "1h+"];
const SKILL_OPTIONS = ["Easy", "Medium", "Hard"];
const MEAL_TYPE_OPTIONS = [
  "Soup", "Salad", "Sandwich", "Pasta", "Stir-fry",
  "Curry", "Pizza", "Tacos", "Bowl", "Burger", "Breakfast", "Dessert",
];
const CUISINE_OPTIONS = [
  "Italian", "Japanese", "Mexican", "Thai", "Indian",
  "Mediterranean", "French", "Korean", "Middle Eastern", "American",
];

export default function VibeInput({ onSubmit }: VibeInputProps) {
  const [vibe, setVibe] = useState("");
  const [showIngredients, setShowIngredients] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [skill, setSkill] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");

  const buildPrefs = () => ({
    diet, time, skill, cuisine, mealType,
    ingredients: showIngredients && ingredients.trim() ? ingredients.trim() : undefined,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (vibe.trim()) onSubmit(vibe.trim(), buildPrefs());
  };

  const handleSurprise = () => {
    const randomVibe = ALL_VIBES[Math.floor(Math.random() * ALL_VIBES.length)];
    onSubmit(randomVibe, buildPrefs());
  };

  const toggleDiet = (option: string) => {
    setDiet((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  const canSubmit = !!vibe.trim();

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2 className={styles.heading}>What's the vibe?</h2>

      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          value={vibe}
          onChange={(e) => setVibe(e.target.value.slice(0, 500))}
          placeholder="Describe a mood, craving, or occasion"
          aria-label="Vibe description"
        />
        {vibe.length >= 400 && (
          <span className={`${styles.charCount} ${vibe.length >= 480 ? styles.charCountWarn : ""}`}>
            {500 - vibe.length}
          </span>
        )}
      </div>

      <button
        type="button"
        className={`${styles.fridgeToggle} ${showIngredients ? styles.fridgeToggleActive : ""}`}
        onClick={() => setShowIngredients((prev) => !prev)}
      >
        {showIngredients ? "− Hide fridge ingredients" : "+ Use what I have"}
      </button>

      {showIngredients && (
        <div className={styles.fridgeSection}>
          <textarea
            className={styles.ingredientInput}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value.slice(0, 500))}
            placeholder="tomatoes, pasta, garlic, olive oil..."
            aria-label="Ingredients you have"
            rows={3}
            autoFocus
          />
          <p className={styles.fridgeHint}>Claude will build your recipe around these ingredients</p>
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionLabel}>QUICK VIBES</p>
        <div className={styles.chips}>
          {QUICK_VIBES.map((label) => (
            <button
              key={label}
              type="button"
              className={`${styles.vibeChip} ${vibe === label ? styles.vibeChipActive : ""}`}
              onClick={() => setVibe(label)}
            >
              <span className={styles.vibeChipDot} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>PREFERENCES</p>
        <div className={styles.prefRow}>
          <span className={styles.prefLabel}>Diet</span>
          <div className={styles.chips}>
            {DIET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.prefChip} ${diet.includes(option) ? styles.prefChipActive : ""}`}
                onClick={() => toggleDiet(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.prefRow}>
          <span className={styles.prefLabel}>Meal</span>
          <div className={styles.chips}>
            {MEAL_TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.prefChip} ${mealType === option ? styles.prefChipActive : ""}`}
                onClick={() => setMealType(mealType === option ? "" : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.prefRow}>
          <span className={styles.prefLabel}>Time</span>
          <div className={styles.chips}>
            {TIME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.prefChip} ${time === option ? styles.prefChipActive : ""}`}
                onClick={() => setTime(time === option ? "" : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.prefRow}>
          <span className={styles.prefLabel}>Skill</span>
          <div className={styles.chips}>
            {SKILL_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.prefChip} ${skill === option ? styles.prefChipActive : ""}`}
                onClick={() => setSkill(skill === option ? "" : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.prefRow}>
          <span className={styles.prefLabel}>Cuisine</span>
          <div className={styles.chips}>
            {CUISINE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.prefChip} ${cuisine === option ? styles.prefChipActive : ""}`}
                onClick={() => setCuisine(cuisine === option ? "" : option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.surpriseBtn} onClick={handleSurprise}>
          ✨ Surprise me
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
          + Generate My Recipe
        </button>
      </div>
    </form>
  );
}

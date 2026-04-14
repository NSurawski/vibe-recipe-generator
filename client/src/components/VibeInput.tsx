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
const DIET_OPTIONS = ["Vegetarian", "Vegan", "GF", "Dairy-free"];
const TIME_OPTIONS = ["< 30 min", "30–60 min", "1h+"];
const SKILL_OPTIONS = ["Easy", "Medium", "Hard"];

export default function VibeInput({ onSubmit }: VibeInputProps) {
  const [mode, setMode] = useState<"vibe" | "ingredients">("vibe");
  const [vibe, setVibe] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [skill, setSkill] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "vibe" && vibe.trim()) {
      onSubmit(vibe.trim(), { diet, time, skill });
    } else if (mode === "ingredients" && ingredients.trim()) {
      onSubmit(`I have these ingredients: ${ingredients.trim()}. Make something great with them.`, { diet, time, skill });
    }
  };

  const handleSurprise = () => {
    const randomVibe = ALL_VIBES[Math.floor(Math.random() * ALL_VIBES.length)];
    onSubmit(randomVibe, { diet, time, skill });
  };

  const toggleDiet = (option: string) => {
    setDiet((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  const canSubmit = mode === "vibe" ? !!vibe.trim() : !!ingredients.trim();

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2 className={styles.heading}>What's the vibe?</h2>

      <div className={styles.modeTabs}>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "vibe" ? styles.modeTabActive : ""}`}
          onClick={() => setMode("vibe")}
        >
          Describe a vibe
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "ingredients" ? styles.modeTabActive : ""}`}
          onClick={() => setMode("ingredients")}
        >
          Use what I have
        </button>
      </div>

      {mode === "vibe" ? (
        <input
          className={styles.input}
          value={vibe}
          onChange={(e) => setVibe(e.target.value.slice(0, 500))}
          placeholder="Describe a mood, craving, or occasion"
          aria-label="Vibe description"
        />
      ) : (
        <textarea
          className={styles.ingredientInput}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value.slice(0, 500))}
          placeholder="tomatoes, pasta, garlic, olive oil..."
          aria-label="Ingredients"
          rows={3}
        />
      )}

      {mode === "vibe" && (
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
      )}

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
      </div>

      <div className={styles.buttonRow}>
        {mode === "vibe" && (
          <button type="button" className={styles.surpriseBtn} onClick={handleSurprise}>
            ✨ Surprise me
          </button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
          {mode === "ingredients" ? "Make Something With This" : "+ Generate My Recipe"}
        </button>
      </div>
    </form>
  );
}

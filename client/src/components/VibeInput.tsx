import { useState, type FormEvent } from "react";
import type { Preferences } from "../types";
import styles from "./VibeInput.module.css";

interface VibeInputProps {
  onSubmit: (vibe: string, preferences: Preferences) => void;
}

const QUICK_VIBES = ["Fancy dinner", "Light & fresh", "Spicy kick", "Date night"];
const DIET_OPTIONS = ["Vegetarian", "Vegan", "GF", "Dairy-free"];
const TIME_OPTIONS = ["< 30 min", "30–60 min", "1h+"];
const SKILL_OPTIONS = ["Easy", "Medium", "Hard"];

export default function VibeInput({ onSubmit }: VibeInputProps) {
  const [vibe, setVibe] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [skill, setSkill] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (vibe.trim()) {
      onSubmit(vibe.trim(), { diet, time, skill });
    }
  };

  const toggleDiet = (option: string) => {
    setDiet((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2 className={styles.heading}>What's the vibe?</h2>

      <input
        className={styles.input}
        value={vibe}
        onChange={(e) => setVibe(e.target.value.slice(0, 500))}
        placeholder="Describe a mood, craving, or occasion"
      />

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

      <button type="submit" className={styles.submitBtn} disabled={!vibe.trim()}>
        + Generate My Recipe
      </button>
    </form>
  );
}

import { useState, type FormEvent } from "react";
import styles from "./VibeInput.module.css";

interface VibeInputProps {
  onSubmit: (vibe: string, healthyOnly: boolean) => void;
  isLoading: boolean;
}

const MAX_LENGTH = 500;

export default function VibeInput({ onSubmit, isLoading }: VibeInputProps) {
  const [vibe, setVibe] = useState("");
  const [healthyOnly, setHealthyOnly] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (vibe.trim() && !isLoading) {
      onSubmit(vibe.trim(), healthyOnly);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <label htmlFor="vibe-input" className={styles.label}>
        Describe your vibe and we'll cook up something perfect
      </label>
      <textarea
        id="vibe-input"
        className={styles.textarea}
        value={vibe}
        onChange={(e) => setVibe(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={`"cozy Sunday with rain outside"\n"chaotic brunch energy"\n"impress a date but I can't really cook"`}
        disabled={isLoading}
      />
      <div
        className={`${styles.charCount} ${vibe.length > MAX_LENGTH - 50 ? styles.charCountWarn : ""}`}
      >
        {vibe.length}/{MAX_LENGTH}
      </div>
      <label className={styles.healthyToggle}>
        <input
          type="checkbox"
          checked={healthyOnly}
          onChange={(e) => setHealthyOnly(e.target.checked)}
          disabled={isLoading}
          className={styles.healthyCheckbox}
        />
        <span className={styles.healthyLabel}>Healthy recipes only</span>
      </label>
      <button
        type="submit"
        className={styles.button}
        disabled={!vibe.trim() || isLoading}
      >
        {isLoading ? "Conjuring your recipe..." : "Generate Recipe"}
      </button>
    </form>
  );
}

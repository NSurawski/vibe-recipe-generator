import { type FormEvent } from "react";
import type { DietaryFilter } from "../types";
import styles from "./VibeInput.module.css";

interface VibeInputProps {
  onSubmit: (vibe: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  filters: DietaryFilter[];
  onFiltersChange: (filters: DietaryFilter[]) => void;
}

const MAX_LENGTH = 500;

const FILTERS: { id: DietaryFilter; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
];

export default function VibeInput({
  onSubmit,
  isLoading,
  value,
  onChange,
  filters,
  onFiltersChange,
}: VibeInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  };

  const toggleFilter = (filter: DietaryFilter) => {
    onFiltersChange(
      filters.includes(filter)
        ? filters.filter((f) => f !== filter)
        : [...filters, filter]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <label htmlFor="vibe-input" className={styles.label}>
        Describe your vibe and we'll cook up something perfect
      </label>
      <textarea
        id="vibe-input"
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={`"cozy Sunday with rain outside"\n"chaotic brunch energy"\n"impress a date but I can't really cook"`}
        disabled={isLoading}
      />
      <div
        className={`${styles.charCount} ${value.length > MAX_LENGTH - 50 ? styles.charCountWarn : ""}`}
      >
        {value.length}/{MAX_LENGTH}
      </div>
      <div className={styles.filters} role="group" aria-label="Dietary filters">
        {FILTERS.map(({ id, label }) => (
          <label
            key={id}
            className={`${styles.filterChip} ${filters.includes(id) ? styles.filterChipActive : ""}`}
          >
            <input
              type="checkbox"
              className={styles.filterCheckbox}
              checked={filters.includes(id)}
              onChange={() => toggleFilter(id)}
              disabled={isLoading}
            />
            {label}
          </label>
        ))}
      </div>
      <button
        type="submit"
        className={styles.button}
        disabled={!value.trim() || isLoading}
      >
        {isLoading ? "Conjuring your recipe..." : "Generate Recipe"}
      </button>
    </form>
  );
}

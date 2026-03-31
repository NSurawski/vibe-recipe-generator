import { useState, useRef } from "react";
import type { Recipe } from "./types";
import VibeInput from "./components/VibeInput";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import styles from "./App.module.css";

const API_URL = "http://localhost:3001";

export default function App() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastVibe = useRef("");
  const lastHealthyOnly = useRef(false);

  const generateRecipe = async (vibe: string, healthyOnly: boolean) => {
    lastVibe.current = vibe;
    lastHealthyOnly.current = healthyOnly;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, healthyOnly }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data: Recipe = await res.json();
      setRecipe(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate recipe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastVibe.current) {
      generateRecipe(lastVibe.current, lastHealthyOnly.current);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Vibe Recipe Generator</h1>
        <p className={styles.subtitle}>
          Describe a mood. Get a recipe that matches.
        </p>
      </header>

      <VibeInput onSubmit={generateRecipe} isLoading={isLoading} />

      {error && <div className={styles.error}>{error}</div>}

      {isLoading && <LoadingState />}

      {recipe && !isLoading && (
        <RecipeCard
          recipe={recipe}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

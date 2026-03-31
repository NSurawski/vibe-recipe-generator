import { useState, useRef } from "react";
import type { Recipe } from "./types";
import VibeInput from "./components/VibeInput";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import RecipeHistory from "./components/RecipeHistory";
import { useRecipeHistory } from "./hooks/useRecipeHistory";
import styles from "./App.module.css";

const API_URL = "http://localhost:3001";

export default function App() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const lastVibe = useRef("");
  const { history, addToHistory } = useRecipeHistory();

  const generateRecipe = async (vibe: string) => {
    lastVibe.current = vibe;
    setIsLoading(true);
    setError(null);
    setStreamingText("");

    try {
      const res = await fetch(`${API_URL}/api/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          let event: { text?: string; done?: boolean; error?: string };
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.error) throw new Error(event.error);

          if (event.done) {
            const cleaned = accumulated
              .replace(/^```(?:json)?\n?/, "")
              .replace(/\n?```$/, "")
              .trim();
            try {
              const parsed: Recipe = JSON.parse(cleaned);
              setRecipe(parsed);
              addToHistory(parsed, vibe);
            } catch {
              throw new Error("Received an unexpected response. Please try again.");
            }
            return;
          }

          if (event.text) {
            accumulated += event.text;
            setStreamingText(accumulated);
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate recipe"
      );
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleRegenerate = () => {
    if (lastVibe.current) {
      generateRecipe(lastVibe.current);
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

      {isLoading && <LoadingState streamingText={streamingText} />}

      {recipe && !isLoading && (
        <RecipeCard
          recipe={recipe}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      )}

      {history.length > 0 && !isLoading && (
        <RecipeHistory
          history={history}
          onSelect={(entry) => setRecipe(entry.recipe)}
        />
      )}
    </div>
  );
}

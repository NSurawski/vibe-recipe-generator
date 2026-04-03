import { useState, useRef } from "react";
import type { Recipe, Preferences } from "./types";
import VibeInput from "./components/VibeInput";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import RecipeHistory from "./components/RecipeHistory";
import { useRecipeHistory } from "./hooks/useRecipeHistory";
import styles from "./App.module.css";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const REQUEST_TIMEOUT_MS = 30_000;

type Screen = "input" | "loading" | "result";

export default function App() {
  const [screen, setScreen] = useState<Screen>("input");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const lastVibe = useRef("");
  const lastPrefs = useRef<Preferences>({ diet: [], time: "", skill: "" });
  const activeController = useRef<AbortController | null>(null);
  const { history, addToHistory, toggleFavorite } = useRecipeHistory();

  const isFavorited = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.favorited ?? false)
    : false;

  const generateRecipe = async (vibe: string, preferences: Preferences) => {
    lastVibe.current = vibe;
    lastPrefs.current = preferences;
    // Abort any in-flight request before starting a new one
    if (activeController.current) {
      activeController.current.abort();
    }

    setScreen("loading");
    setError(null);
    setStreamingText("");

    const controller = new AbortController();
    activeController.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/api/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, preferences }),
        signal: controller.signal,
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
            try {
              const parsed: Recipe = JSON.parse(accumulated.trim());
              setRecipe(parsed);
              const entryId = addToHistory(parsed, vibe);
              setCurrentEntryId(entryId);
              setScreen("result");
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
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out — please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to generate recipe");
      }
      setScreen("input");
    } finally {
      clearTimeout(timeout);
      if (activeController.current === controller) {
        activeController.current = null;
      }
      setStreamingText("");
    }
  };

  const handleBack = () => {
    setScreen("input");
  };

  const handleRegenerate = () => {
    if (lastVibe.current) {
      generateRecipe(lastVibe.current, lastPrefs.current);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Vibe Recipe Generator</h1>
        <p className={styles.subtitle}>Tell it a vibe. Get a recipe.</p>
        <div className={styles.accent} />
      </header>

      <main className={styles.main}>
        {screen === "input" && (
          <>
            {error && (
              <div className={styles.error} role="alert">
                <div className={styles.errorContent}>
                  <span>{error}</span>
                  {lastVibe.current && (
                    <button className={styles.retryBtn} onClick={handleRegenerate}>
                      Try again
                    </button>
                  )}
                </div>
                <button className={styles.errorDismiss} onClick={() => setError(null)} aria-label="Dismiss error">×</button>
              </div>
            )}
            <VibeInput onSubmit={generateRecipe} />
            {history.length > 0 && (
              <RecipeHistory
                history={history}
                onSelect={(entry) => {
                  setRecipe(entry.recipe);
                  setCurrentEntryId(entry.id);
                  setScreen("result");
                }}
              />
            )}
          </>
        )}
        {screen === "loading" && (
          <LoadingState onBack={handleBack} streamingText={streamingText} />
        )}
        {screen === "result" && recipe && (
          <RecipeCard
            recipe={recipe}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            isFavorited={isFavorited}
            onToggleFavorite={() => currentEntryId && toggleFavorite(currentEntryId)}
          />
        )}
      </main>
    </div>
  );
}

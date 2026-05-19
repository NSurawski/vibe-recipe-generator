import { useState, useRef, useEffect } from "react";
import type { Recipe, Preferences } from "./types";
import VibeInput from "./components/VibeInput";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import RecipeHistory from "./components/RecipeHistory";
import RecipeOfTheDay from "./components/RecipeOfTheDay";
import EmptyHistory from "./components/EmptyHistory";
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
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const lastVibe = useRef("");
  const lastPrefs = useRef<Preferences>({ diet: [], time: "", skill: "", cuisine: "" });
  const activeController = useRef<AbortController | null>(null);
  const { history, addToHistory, toggleFavorite, rateRecipe, updateNote, deleteEntry, updateServings, setCollection } = useRecipeHistory();
  const isDailyRecipeRef = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarding-seen"));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark-mode") === "true");

  const isFavorited = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.favorited ?? false)
    : false;

  const currentRating = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.rating ?? 0)
    : 0;

  const currentNote = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.note ?? "")
    : "";

  const currentServings = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.servings ?? undefined)
    : undefined;

  const currentCollection = currentEntryId
    ? (history.find((e) => e.id === currentEntryId)?.collection ?? "")
    : "";

  const generateRecipe = async (vibe: string, preferences: Preferences) => {
    lastVibe.current = vibe;
    lastPrefs.current = preferences;
    // Abort any in-flight request before starting a new one
    if (activeController.current) {
      activeController.current.abort();
    }

    setScreen("loading");
    setError(null);
    setRetryAfter(null);
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
        if (res.status === 429 && data.retryAfter) {
          setRetryAfter(data.retryAfter);
        }
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
              let jsonText = accumulated.trim();
              const jsonStart = jsonText.indexOf("{");
              const jsonEnd = jsonText.lastIndexOf("}");
              if (jsonStart !== -1 && jsonEnd > jsonStart) {
                jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
              }
              const parsed: Recipe = JSON.parse(jsonText);
              setRecipe(parsed);
              const entryId = addToHistory(parsed, vibe);
              setCurrentEntryId(entryId);
              setScreen("result");
              if (isDailyRecipeRef.current) {
                const today = new Date().toISOString().slice(0, 10);
                localStorage.setItem("recipe-of-day", JSON.stringify({ date: today, recipe: parsed }));
                isDailyRecipeRef.current = false;
              }
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

  // Load recipe from shared URL on first render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("r");
    if (encoded) {
      try {
        const decoded: Recipe = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        setRecipe(decoded);
        const entryId = addToHistory(decoded, "shared link");
        setCurrentEntryId(entryId);
        setScreen("result");
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // Invalid param — ignore
      }
    }
  }, []);

  const handleShare = async () => {
    if (!recipe) return;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(recipe))));
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text: recipe.description, url });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }
    navigator.clipboard.writeText(url);
  };

  const DAILY_VIBES = [
    "cozy morning at home", "fresh and light to start the day", "easy comforting weeknight",
    "something a bit indulgent", "healthy and vibrant", "warm and satisfying",
  ];

  const handleGenerateDaily = () => {
    const vibe = DAILY_VIBES[Math.floor(Math.random() * DAILY_VIBES.length)];
    isDailyRecipeRef.current = true;
    generateRecipe(vibe, { diet: [], time: "", skill: "", cuisine: "" });
  };

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    if (!retryAfter) return;
    const id = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && screen !== "input") {
        handleBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen]);

  const handleBack = () => {
    setScreen("input");
  };

  const handleRegenerate = () => {
    if (lastVibe.current) {
      generateRecipe(lastVibe.current, lastPrefs.current);
    }
  };

  const handleModify = async (modification: string) => {
    if (!recipe) return;
    if (activeController.current) activeController.current.abort();

    setScreen("loading");
    setError(null);
    setStreamingText("");

    const controller = new AbortController();
    activeController.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/api/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, modification }),
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
          try { event = JSON.parse(line.slice(6)); } catch { continue; }
          if (event.error) throw new Error(event.error);
          if (event.done) {
            try {
              let jsonText = accumulated.trim();
              const jsonStart = jsonText.indexOf("{");
              const jsonEnd = jsonText.lastIndexOf("}");
              if (jsonStart !== -1 && jsonEnd > jsonStart) jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
              const parsed: Recipe = JSON.parse(jsonText);
              setRecipe(parsed);
              const entryId = addToHistory(parsed, modification);
              setCurrentEntryId(entryId);
              setScreen("result");
            } catch {
              throw new Error("Received an unexpected response. Please try again.");
            }
            return;
          }
          if (event.text) { accumulated += event.text; setStreamingText(accumulated); }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out — please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to modify recipe");
      }
      setScreen("input");
    } finally {
      clearTimeout(timeout);
      if (activeController.current === controller) activeController.current = null;
      setStreamingText("");
    }
  };

  return (
    <div className={styles.app} data-theme={darkMode ? "dark" : "light"}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.logoRow}>
              <span className={styles.logoIcon}>🥘</span>
              <h1 className={styles.title}>Vibe Recipe</h1>
            </div>
            <p className={styles.subtitle}>Tell it a vibe. Get a recipe.</p>
          </div>
          <button
            className={styles.themeToggle}
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              localStorage.setItem("dark-mode", String(next));
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <div className={styles.accent} />
      </header>

      <main className={styles.main} ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>
        {screen === "input" && (
          <div className={styles.screenEnter}>
            {showOnboarding && (
              <div className={styles.onboarding}>
                <p className={styles.onboardingText}>
                  <strong>Welcome!</strong> Describe a mood, craving, or occasion — and Claude will generate a unique recipe that matches your vibe. Try "cozy rainy day" or "impress the in-laws".
                </p>
                <button
                  className={styles.onboardingDismiss}
                  onClick={() => { localStorage.setItem("onboarding-seen", "true"); setShowOnboarding(false); }}
                >
                  Got it ✓
                </button>
              </div>
            )}
            {error && (
              <div className={styles.error} role="alert">
                <div className={styles.errorContent}>
                  <span>{error}</span>
                  {retryAfter && (
                    <span className={styles.retryCountdown}>
                      Retry in {retryAfter}s
                    </span>
                  )}
                  {lastVibe.current && !retryAfter && (
                    <button className={styles.retryBtn} onClick={handleRegenerate}>
                      Try again
                    </button>
                  )}
                </div>
                <button className={styles.errorDismiss} onClick={() => setError(null)} aria-label="Dismiss error">×</button>
              </div>
            )}
            <RecipeOfTheDay
              onSelect={(r) => { setRecipe(r); setScreen("result"); setCurrentEntryId(null); }}
              onGenerate={handleGenerateDaily}
            />
            <VibeInput onSubmit={generateRecipe} />
            {history.length > 0 ? (
              <RecipeHistory
                history={history}
                onSelect={(entry) => {
                  setRecipe(entry.recipe);
                  setCurrentEntryId(entry.id);
                  setScreen("result");
                }}
                onDelete={deleteEntry}
              />
            ) : (
              <EmptyHistory onGenerate={(vibe) => generateRecipe(vibe, { diet: [], time: "", skill: "", cuisine: "" })} />
            )}
          </div>
        )}
        {screen === "loading" && (
          <div className={styles.screenEnter}>
            <LoadingState onBack={handleBack} streamingText={streamingText} />
          </div>
        )}
        {screen === "result" && recipe && (
          <RecipeCard
            key={currentEntryId ?? recipe.title}
            recipe={recipe}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            isFavorited={isFavorited}
            onToggleFavorite={() => currentEntryId && toggleFavorite(currentEntryId)}
            rating={currentRating}
            onRate={(r) => currentEntryId && rateRecipe(currentEntryId, r)}
            onShare={handleShare}
            note={currentNote}
            onNoteChange={(n) => currentEntryId && updateNote(currentEntryId, n)}
            savedServings={currentServings}
            onServingsChange={(s) => currentEntryId && updateServings(currentEntryId, s)}
            collection={currentCollection}
            onCollectionChange={(c) => currentEntryId && setCollection(currentEntryId, c)}
            onModify={handleModify}
          />
        )}
      </main>
    </div>
  );
}

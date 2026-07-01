import { useEffect, useRef, useState } from "react";
import styles from "./CookingMode.module.css";

interface CookingModeProps {
  steps: string[];
  title: string;
  onClose: () => void;
}

export default function CookingMode({ steps, title, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isLast = currentStep === steps.length - 1;

  useEffect(() => {
    if ("wakeLock" in navigator) {
      (navigator.wakeLock as WakeLock).request("screen").then((lock) => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    }
    return () => { wakeLockRef.current?.release(); };
  }, []);

  function advance() {
    if (!isLast) setCurrentStep((s) => s + 1);
  }

  function retreat() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  return (
    <div
      className={styles.overlay}
      onClick={advance}
      role="main"
      aria-label={`Cooking mode — step ${currentStep + 1} of ${steps.length}`}
    >
      <button
        className={styles.closeBtn}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Exit cooking mode"
      >
        ✕
      </button>

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className={styles.meta}>
        <span className={styles.recipeTitle}>{title}</span>
        <span className={styles.stepCounter}>
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className={styles.stepContent}>
        <p className={styles.stepText}>{steps[currentStep]}</p>
      </div>

      <div className={styles.footer} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.navBtn}
          onClick={retreat}
          disabled={currentStep === 0}
          aria-label="Previous step"
        >
          ← Prev
        </button>

        {isLast ? (
          <button className={`${styles.navBtn} ${styles.doneBtn}`} onClick={onClose}>
            Done!
          </button>
        ) : (
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={advance}>
            Next →
          </button>
        )}
      </div>

      {!isLast && (
        <p className={styles.tapHint}>tap screen to advance</p>
      )}
    </div>
  );
}

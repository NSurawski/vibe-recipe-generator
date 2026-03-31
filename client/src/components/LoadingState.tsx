import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  onBack: () => void;
  streamingText?: string;
}

export default function LoadingState({ onBack, streamingText }: LoadingStateProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <button className={styles.back} onClick={onBack}>
        ← Back
      </button>
      <h2 className={styles.heading}>Your Recipe</h2>

      <div className={styles.spinnerWrap}>
        <div className={styles.spinner} />
      </div>

      <p className={styles.text}>Crafting your recipe...</p>
      <p className={styles.subtext}>
        Claude is cooking <span className={styles.cursor}>▌</span>
      </p>

      {streamingText ? (
        <pre className={styles.stream}>{streamingText}</pre>
      ) : (
        <div className={styles.skeletons}>
          <div className={styles.skeleton} style={{ width: "85%" }} />
          <div className={styles.skeleton} style={{ width: "70%" }} />
          <div className={styles.skeleton} style={{ width: "90%" }} />
          <div className={styles.skeleton} style={{ width: "60%" }} />
          <div className={styles.skeleton} style={{ width: "80%" }} />
        </div>
      )}
    </div>
  );
}

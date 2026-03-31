import { useRef } from "react";
import styles from "./LoadingState.module.css";

const MESSAGES = [
  "Channeling your vibe into flavor",
  "Raiding the pantry of imagination",
  "Seasoning with creativity",
  "Plating something special",
  "Consulting the culinary cosmos",
];

interface LoadingStateProps {
  streamingText?: string;
}

export default function LoadingState({ streamingText }: LoadingStateProps) {
  const messageRef = useRef(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  return (
    <div className={styles.container} role="status" aria-live="polite" aria-label="Generating recipe">
      <div className={styles.emoji}>🍳</div>
      <p className={styles.text}>
        {messageRef.current}
        <span className={styles.dots} />
      </p>
      {streamingText && (
        <pre className={styles.stream}>{streamingText}</pre>
      )}
    </div>
  );
}

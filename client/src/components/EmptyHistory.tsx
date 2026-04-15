import styles from "./EmptyHistory.module.css";

const STARTER_VIBES = [
  "Cozy rainy day",
  "Date night",
  "Hungover but hungry",
  "Something adventurous",
];

interface Props {
  onGenerate: (vibe: string) => void;
}

export default function EmptyHistory({ onGenerate }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>✨ INSPIRATION</p>
      <p className={styles.text}>Your generated recipes will appear here. Try one of these to get started:</p>
      <div className={styles.vibes}>
        {STARTER_VIBES.map((vibe) => (
          <button key={vibe} className={styles.vibeBtn} onClick={() => onGenerate(vibe)}>
            {vibe} →
          </button>
        ))}
      </div>
    </div>
  );
}

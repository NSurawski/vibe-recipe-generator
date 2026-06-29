import { useState, useRef } from "react";
import type { Recipe } from "../types";
import styles from "./ShareModal.module.css";

interface ShareModalProps {
  recipe: Recipe;
  onClose: () => void;
}

function buildShareUrl(recipe: Recipe): string {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(recipe))));
  return `${window.location.origin}${window.location.pathname}?r=${encoded}`;
}

export default function ShareModal({ recipe, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageSeed = recipe.title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `${recipe.title}, food photography, professional plating, appetizing, soft natural lighting`
  )}?width=640&height=400&nologo=true&seed=${imageSeed}&model=flux`;

  async function handleCopyLink() {
    const url = buildShareUrl(recipe);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#1a1612",
      });
      const link = document.createElement("a");
      link.download = `${recipe.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalLabel}>SHARE CARD</p>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div ref={cardRef} className={styles.shareCard}>
          <img
            src={imageUrl}
            alt={recipe.title}
            className={styles.cardImage}
            crossOrigin="anonymous"
          />
          <div className={styles.cardBody}>
            {recipe.tags && recipe.tags.length > 0 && (
              <div className={styles.cardTags}>
                {recipe.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className={styles.cardTag}>{tag}</span>
                ))}
              </div>
            )}
            <h2 className={styles.cardTitle}>{recipe.title}</h2>
            {recipe.description && (
              <p className={styles.cardDescription}>{recipe.description}</p>
            )}
            <div className={styles.cardMeta}>
              <span>{recipe.time}</span>
              <span className={styles.cardMetaDot}>·</span>
              <span>{recipe.difficulty}</span>
              {recipe.servings && (
                <>
                  <span className={styles.cardMetaDot}>·</span>
                  <span>{recipe.servings}</span>
                </>
              )}
            </div>
            {recipe.vibe_notes && (
              <p className={styles.cardVibeNotes}>"{recipe.vibe_notes}"</p>
            )}
            <p className={styles.cardBrand}>✦ Vibe Recipe</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
          <button className={styles.downloadBtn} onClick={handleDownload} disabled={downloading}>
            {downloading ? "Saving…" : "Download Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

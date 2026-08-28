import styles from "./NextActionCard.module.css";

export interface NextActionCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onAction: () => void;
}

/** discussion.md 4절: 1.5px ink 테두리, radius 16~18, NEXT 캡션 + 제목 + 설명 + CTA(높이 48~50). */
export function NextActionCard({ title, description, ctaLabel, onAction }: NextActionCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.caption}>NEXT</span>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      <button type="button" className={styles.cta} onClick={onAction}>
        {ctaLabel}
      </button>
    </div>
  );
}

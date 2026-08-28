import styles from "./ProgressBar.module.css";

export interface ProgressBarProps {
  value: number;
  max: number;
}

/** discussion.md 4절: 높이 6, radius 999, 트랙 sunken / 바 ink. 분모 0을 방어해 NaN%를 만들지 않는다. */
export function ProgressBar({ value, max }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={styles.bar} style={{ width: `${pct}%` }} />
    </div>
  );
}

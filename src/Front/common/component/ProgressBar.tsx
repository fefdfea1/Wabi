import styles from "./ProgressBar.module.css";

export interface ProgressBarProps {
  value: number;
  max: number;
  /**
   * discussion.md 42.5절(PM 실측): aria-label 없이는 낭독기가 "진행률 0"으로만 읽어 무엇의
   * 진행인지 알 수 없다 — 화면마다(준비 진행률/출국 전 준비/현지 정착) 다른 이름을 넘긴다.
   */
  ariaLabel: string;
}

/** discussion.md 4절: 높이 6, radius 999, 트랙 sunken / 바 ink. 분모 0을 방어해 NaN%를 만들지 않는다. */
export function ProgressBar({ value, max, ariaLabel }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={styles.bar} style={{ width: `${pct}%` }} />
    </div>
  );
}

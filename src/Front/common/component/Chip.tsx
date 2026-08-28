import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipProps = {
  label: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

/**
 * discussion.md 4절: 높이 36~40, radius 10~11. 선택 시 ink 배경, 미선택 시 sunken 배경.
 * onClick이 없으면 순수 표시용 태그이므로 button이 아닌 span으로 렌더링한다(가짜 클릭 어포던스 방지).
 */
export function Chip({ label, selected = false, onClick }: ChipProps) {
  const className = [styles.chip, selected ? styles.selected : styles.unselected].join(" ");

  if (!onClick) {
    return <span className={className}>{label}</span>;
  }

  return (
    <button type="button" className={className} aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

import styles from "./Segment.module.css";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

/** discussion.md 4절: sunken 트랙에 padding 4, 선택 탭은 surface 배경 + 700. */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentProps<T>) {
  return (
    <div className={styles.track} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={[styles.option, selected ? styles.selected : ""].filter(Boolean).join(" ")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

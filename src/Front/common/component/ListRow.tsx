import styles from "./ListRow.module.css";

export interface ListRowProps {
  title: string;
  /** discussion.md 22.2절: 마감 표시 전용. 없으면(기본 제공 할 일 중 마감일이 없는 것) 이 자리를 비운다. */
  meta?: string;
  done: boolean;
  urgent: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

/**
 * 홈/할 일 목록에서 재사용하는 행. 체크 원(48x48 터치 영역, 22px 시각 원)과
 * 행 본문(제목/메타/화살표)을 형제 버튼으로 분리해, 체크 클릭이 상세 열기로 전파되지 않게 한다
 * (discussion.md 7절: 체크 토글은 체크 원에서만, 행 클릭은 상세 열기).
 */
export function ListRow({ title, meta, done, urgent, onToggle, onOpen }: ListRowProps) {
  const circleClassName = [
    styles.circle,
    done ? styles.circleDone : urgent ? styles.circleUrgent : "",
  ]
    .filter(Boolean)
    .join(" ");
  const titleClassName = [styles.title, done ? styles.titleDone : ""].filter(Boolean).join(" ");
  const metaClassName = [
    styles.meta,
    done ? styles.metaDone : urgent ? styles.metaUrgent : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.checkButton}
        aria-pressed={done}
        aria-label={done ? `${title} 완료 취소하기` : `${title} 완료로 표시하기`}
        onClick={onToggle}
      >
        <span className={circleClassName}>{done ? <span aria-hidden="true">✓</span> : null}</span>
      </button>
      <button type="button" className={styles.body} onClick={onOpen}>
        <span className={styles.texts}>
          <span className={titleClassName}>{title}</span>
          {meta ? <span className={metaClassName}>{meta}</span> : null}
        </span>
        {!done ? (
          <span className={styles.chevron} aria-hidden="true">
            ›
          </span>
        ) : null}
      </button>
    </div>
  );
}

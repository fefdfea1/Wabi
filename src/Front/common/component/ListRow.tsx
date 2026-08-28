import styles from "./ListRow.module.css";

export interface ListRowProps {
  title: string;
  /** discussion.md 22.2절: 마감 표시 전용. 없으면(기본 제공 할 일 중 마감일이 없는 것) 이 자리를 비운다. */
  meta?: string;
  done: boolean;
  urgent: boolean;
  onToggle: () => void;
  /** discussion.md 27.2절: 목록의 모든 할 일이 이제 이용자가 넣거나 고른 것이라(23절) 지울 수
   *  있어야 한다. 확인 시트를 여는 것은 호출부(useWabiApp의 requestDeleteTask) 책임이다. */
  onDelete: () => void;
}

/**
 * 홈/할 일 목록에서 재사용하는 행.
 *
 * discussion.md 27.1절: 예전에는 체크 원 버튼과 본문 버튼이 형제로 나뉘어(체크=토글, 본문=상세
 * 열기) 있었지만, 상세로 가는 길을 없애면서 하나로 합쳤다 — 행 전체가 완료 토글이고, 화살표는
 * 없앴다(누를 곳이 없어졌으므로 남아 있으면 거짓말이 된다). 체크 원의 터치 영역(48px)은 그
 * 시각 자리만 유지하고, 버튼 자체는 행 전체다.
 *
 * discussion.md 27.2절: 삭제는 토글과 별개 버튼이다 — 메모 행(NotesPanel)과 같은 어휘로 평소엔
 * 폭 0이고 마우스를 올리면 오른쪽에서 밀고 들어오며(ListRow.module.css), 터치 기기(hover 없음)
 * 에서는 NotesScreen처럼 항상 48px로 보인다. 토글 버튼 하나 + 삭제 버튼 하나, 두 형제 버튼
 * 구조라 버튼 안에 버튼이 없다.
 */
export function ListRow({ title, meta, done, urgent, onToggle, onDelete }: ListRowProps) {
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
        className={styles.toggle}
        aria-pressed={done}
        aria-label={done ? `${title} 완료 취소하기` : `${title} 완료로 표시하기`}
        onClick={onToggle}
      >
        <span className={styles.checkArea} aria-hidden="true">
          <span className={circleClassName}>{done ? <span>✓</span> : null}</span>
        </span>
        <span className={styles.texts}>
          <span className={titleClassName}>{title}</span>
          {meta ? <span className={metaClassName}>{meta}</span> : null}
        </span>
      </button>
      <button type="button" className={styles.deleteButton} aria-label={`${title} 삭제하기`} onClick={onDelete}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 4h10M6.5 4V2.5h3V4M4.5 4v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

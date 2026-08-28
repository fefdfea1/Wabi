import { SourceLink } from "@/Front/common/component/SourceLink";
import type { Task } from "@/Front/common/types/domain";
import styles from "./TaskDetailScreen.module.css";

export interface TaskDetailScreenProps {
  task: Task;
  done: boolean;
  onClose: () => void;
  onComplete: () => void;
  onUndo: () => void;
}

/**
 * 할 일 상세 전체 화면. 완료 처리(completeDetail)는 상세를 닫지만,
 * 완료 취소(undoDetail)는 상세를 열어 둔 채 스타일만 갱신한다(discussion.md 5.1절, QAPlan DETAIL-04/06).
 */
export function TaskDetailScreen({ task, done, onClose, onComplete, onUndo }: TaskDetailScreenProps) {
  const hasItems = task.items.length > 0;
  const dueColorClassName = task.urgent && !done ? styles.metaUrgent : styles.metaMuted;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
      {/*
        discussion.md 11.1절: 데스크톱(>=1024px)에서는 이 화면이 전체를 덮지 않고 본문 영역에만
        표시된다(사이드바는 그대로 노출). .overlay가 사이드바 폭만큼 자리를 비켜 앉고,
        .inner가 본문과 같은 최대 폭으로 안쪽 내용을 가운데 정렬한다.
      */}
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={onClose} aria-label="뒤로 가기">
            ‹
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.headingBlock}>
            <span className={styles.tag}>{task.tag}</span>
            <h1 id="task-detail-title" className={styles.title}>
              {task.title}
            </h1>
            <p className={[styles.meta, dueColorClassName].join(" ")}>{done ? "완료됨" : task.meta}</p>
          </div>
          <p className={styles.body}>{task.body}</p>
          {hasItems ? (
            <div className={styles.itemsBlock}>
              <p className={styles.itemsHeading}>준비물</p>
              <div className={styles.itemList}>
                {task.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <span className={styles.itemDot} aria-hidden="true" />
                    <span className={styles.itemLabel}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <SourceLink url={task.sourceUrl} />
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className={done ? styles.ctaDone : styles.cta}
            onClick={onComplete}
            disabled={done}
          >
            {done ? "완료됨" : "완료로 표시하기"}
          </button>
          {done ? (
            <button type="button" className={styles.undo} onClick={onUndo}>
              완료 취소하기
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

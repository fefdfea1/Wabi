"use client";

import { useEffect } from "react";
import { SourceLink } from "@/Front/common/component/SourceLink";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import type { Task } from "@/Front/common/types/domain";
import styles from "./TaskDetailScreen.module.css";

export interface TaskDetailScreenProps {
  task: Task;
  done: boolean;
  onClose: () => void;
  onComplete: () => void;
  onUndo: () => void;
}

/* discussion.md 20.11절/20.12절: 나가는 애니메이션(0.45s)이 다 돌 시간을 준 뒤에야 실제 onClose를 부른다. */
const CLOSE_ANIMATION_MS = 450;

/**
 * 할 일 상세 전체 화면. 완료 처리(completeDetail)는 상세를 닫지만,
 * 완료 취소(undoDetail)는 상세를 열어 둔 채 스타일만 갱신한다(discussion.md 5.1절, QAPlan DETAIL-04/06).
 *
 * discussion.md 20.11절 2번: 시트가 아닌 전체 화면 오버레이도 딤 영역(바깥) 클릭으로 닫혀야
 * 한다 — .overlay 자체의 클릭은 닫고, .inner(실제 내용) 클릭은 전파를 막아 안쪽을 눌렀을 때는
 * 닫히지 않는다. Escape도 BottomSheet와 같은 방식으로 계속 동작해야 한다.
 *
 * discussion.md 20.12절: 뒤로 가기·바깥 클릭·Escape는 모두 requestClose를 불러 나가는
 * 애니메이션(closing 클래스)을 먼저 재생하고, 그게 끝난 뒤에야(useClosingTransition) 실제
 * onClose로 언마운트한다 — 시트·모달과 같은 방식이다.
 */
export function TaskDetailScreen({ task, done, onClose, onComplete, onUndo }: TaskDetailScreenProps) {
  const hasItems = task.items.length > 0;
  const dueColorClassName = task.urgent && !done ? styles.metaUrgent : styles.metaMuted;
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  return (
    <div
      className={[styles.overlay, closing ? styles.overlayClosing : ""].filter(Boolean).join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      onClick={requestClose}
    >
      {/*
        discussion.md 11.1절: 데스크톱(>=1024px)에서는 이 화면이 전체를 덮지 않고 본문 영역에만
        표시된다(사이드바는 그대로 노출). .overlay가 사이드바 폭만큼 자리를 비켜 앉고,
        .inner가 본문과 같은 최대 폭으로 안쪽 내용을 가운데 정렬한다.
      */}
      <div className={styles.inner} onClick={(event) => event.stopPropagation()}>
        <div className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={requestClose} aria-label="뒤로 가기">
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

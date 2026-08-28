"use client";

import { useEffect, useState } from "react";
import { ConfirmSheet } from "@/Front/common/component/ConfirmSheet";
import { SourceLink } from "@/Front/common/component/SourceLink";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import type { Task } from "@/Front/common/types/domain";
import styles from "./TaskDetailScreen.module.css";

export interface TaskDetailScreenProps {
  task: Task;
  done: boolean;
  /** discussion.md 21.4절: 직접 추가한 할 일에만 삭제 버튼을 보여준다(기본 제공 할 일은 삭제 대상이 아니다). */
  isCustom: boolean;
  onClose: () => void;
  onComplete: () => void;
  onUndo: () => void;
  /** 확인 시트에서 삭제를 최종 확정했을 때 부른다. 실제 삭제·상세 닫기는 호출부(useWabiApp)가 처리한다. */
  onDelete: () => void;
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
export function TaskDetailScreen({ task, done, isCustom, onClose, onComplete, onUndo, onDelete }: TaskDetailScreenProps) {
  const hasItems = task.items.length > 0;
  const dueColorClassName = task.urgent && !done ? styles.metaUrgent : styles.metaMuted;
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  return (
    <>
      {/* discussion.md 21.4절: 확인 시트를 이 .overlay의 형제로 둔다(자식으로 두면 시트의 딤
          클릭이 여기까지 버블링돼 상세 화면 자체의 requestClose까지 함께 불려 둘 다 닫혀버린다). */}
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
              {/* discussion.md 22.2절: meta는 마감 표시 전용이다. 마감일이 없어 값이 없으면
                  (기본 제공 할 일 중 다수) 이 자리를 통째로 비운다 — 빈 문자열이나 대체 문구를
                  넣지 않는다. "완료됨"은 마감과 무관한 상태 표시라 meta 유무와 상관없이 보여준다. */}
              {done || task.meta ? (
                <p className={[styles.meta, dueColorClassName].join(" ")}>{done ? "완료됨" : task.meta}</p>
              ) : null}
            </div>
            {/* discussion.md 37.1절: 이용자가 직접 적은 할 일은 이제 body가 비어 있을 수 있다
                (앱이 "직접 등록한 할 일입니다." 같은 문구를 대신 지어내지 않는다) — 비어 있으면
                이 자리도 그리지 않는다(같은 원칙, 빈 줄을 남기지 않는다). */}
            {task.body ? <p className={styles.body}>{task.body}</p> : null}
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
            {isCustom ? (
              <button type="button" className={styles.deleteButton} onClick={() => setConfirmDeleteOpen(true)}>
                삭제하기
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {confirmDeleteOpen ? (
        // discussion.md 21.4절: BottomSheet 내부 .overlay는 z-index:50인데 이 화면 자체의
        // .overlay는 60이다 — 형제로 렌더된 확인 시트가 그 뒤에 깔려 버튼을 누를 수 없었다(실측
        // 확인: 클릭이 상세 화면의 .content에 가로채짐). 새 스태킹 컨텍스트를 만들어 확실히 위로 올린다.
        <div className={styles.confirmLayer}>
          <ConfirmSheet
            titleId="task-delete-confirm-title"
            title="이 할 일을 삭제할까요?"
            description="삭제하면 되돌릴 수 없습니다."
            confirmLabel="삭제하기"
            onConfirm={onDelete}
            onClose={() => setConfirmDeleteOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}

"use client";

import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import styles from "./ConfirmSheet.module.css";

/* discussion.md 20.12절: BottomSheet 나가는 애니메이션(모바일·태블릿 0.34s)이 다 돌 시간을 준다. */
const CLOSE_ANIMATION_MS = 340;

export interface ConfirmSheetProps {
  titleId: string;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * discussion.md 21.4절: 파괴적 동작(삭제 등) 전에 확인을 받는 공용 시트. BottomSheet를 그대로
 * 써서 다른 시트와 등장·퇴장 애니메이션이 같고, 딤 클릭·Escape가 취소와 같다(20.11절 2번과
 * 같은 원칙 — 실수로 연 시트를 벗어나는 가장 쉬운 방법이 취소여야 한다).
 */
export function ConfirmSheet({
  titleId,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);

  return (
    <BottomSheet
      titleId={titleId}
      closing={closing}
      onRequestClose={requestClose}
      footer={
        <>
          <button type="button" className={styles.confirmButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className={styles.cancelButton} onClick={requestClose}>
            {cancelLabel}
          </button>
        </>
      }
    >
      <div className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </BottomSheet>
  );
}

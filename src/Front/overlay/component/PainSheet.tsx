import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { SourceLink } from "@/Front/common/component/SourceLink";
import type { PainItem } from "@/Front/common/types/domain";
import styles from "./PainSheet.module.css";

export interface PainSheetProps {
  items: PainItem[];
  itemId: string | null;
  onOpenItem: (id: string) => void;
  answer: PainItem | null;
  onBack: () => void;
  onClose: () => void;
}

/** 어려움 시트. 번호가 매겨진 목록 ↔ 상세(시점·본문·대처법)를 오간다(discussion.md 5.1절). */
export function PainSheet({ items, itemId, onOpenItem, answer, onBack, onClose }: PainSheetProps) {
  const isAnswerMode = !!itemId && !!answer;

  return (
    <BottomSheet
      titleId="pain-sheet-title"
      onClose={onClose}
      footer={
        <button type="button" className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      }
    >
      {isAnswerMode ? (
        <div className={styles.answer}>
          <button type="button" className={styles.backLink} onClick={onBack}>
            ‹ 목록
          </button>
          <div className={styles.answerHeading}>
            <span className={styles.answerWhen}>{answer.when}</span>
            <h2 id="pain-sheet-title" className={styles.answerTitle}>
              {answer.title}
            </h2>
          </div>
          <p className={styles.answerBody}>{answer.body}</p>
          {answer.points.length > 0 ? (
            <div className={styles.pointsBlock}>
              <p className={styles.pointsHeading}>대처법</p>
              <ul className={styles.points}>
                {answer.points.map((point, index) => (
                  <li key={index} className={styles.point}>
                    <span className={styles.pointDot} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <SourceLink url={answer.sourceUrl} />
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeading}>
            <h2 id="pain-sheet-title" className={styles.listTitle}>
              먼저 간 사람들이 힘들어한 것
            </h2>
            <p className={styles.listDescription}>미리 알면 대처가 쉬워지는 순서로 정리했습니다.</p>
          </div>
          <div className={styles.itemList}>
            {items.length === 0 ? (
              <p className={styles.empty}>준비 중인 항목입니다.</p>
            ) : (
              items.map((item) => (
                <button key={item.id} type="button" className={styles.itemRow} onClick={() => onOpenItem(item.id)}>
                  <span className={styles.itemNum}>{String(item.num).padStart(2, "0")}</span>
                  <span className={styles.itemTexts}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemWhen}>{item.when}</span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    ›
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

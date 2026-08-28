import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { Segment } from "@/Front/common/component/Segment";
import { SourceLink } from "@/Front/common/component/SourceLink";
import type { GuideItem, GuideSituation } from "@/Front/common/types/domain";
import styles from "./GuideSheet.module.css";

export interface GuideSheetProps {
  situation: GuideSituation;
  onSituationChange: (situation: GuideSituation) => void;
  questions: GuideItem[];
  questionId: string | null;
  onOpenQuestion: (id: string) => void;
  answer: GuideItem | null;
  onBack: () => void;
  onClose: () => void;
}

const SITUATION_OPTIONS: { value: GuideSituation; label: string }[] = [
  { value: "pre", label: "출국 전" },
  { value: "post", label: "현지 도착" },
];

/** 가이드 시트. 목록(상황별 질문) ↔ 답변 상세를 오가는 2단 구조(discussion.md 5.1절). */
export function GuideSheet({
  situation,
  onSituationChange,
  questions,
  questionId,
  onOpenQuestion,
  answer,
  onBack,
  onClose,
}: GuideSheetProps) {
  const isAnswerMode = !!questionId && !!answer;

  return (
    <BottomSheet
      titleId="guide-sheet-title"
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
            ‹ {situation === "pre" ? "출국 전" : "현지 도착"}
          </button>
          <h2 id="guide-sheet-title" className={styles.answerTitle}>
            {answer.title}
          </h2>
          <p className={styles.answerBody}>{answer.body}</p>
          {answer.points.length > 0 ? (
            <ul className={styles.points}>
              {answer.points.map((point, index) => (
                <li key={index} className={styles.point}>
                  <span className={styles.pointDot} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <SourceLink url={answer.sourceUrl} />
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeading}>
            <h2 id="guide-sheet-title" className={styles.listTitle}>
              현재 어떤 상황인가요?
            </h2>
            <p className={styles.listDescription}>상황에 맞는 질문만 모아 보여드립니다.</p>
          </div>
          <Segment
            options={SITUATION_OPTIONS}
            value={situation}
            onChange={onSituationChange}
            aria-label="출국 전 또는 현지 도착 선택"
          />
          <div className={styles.questionList}>
            {questions.length === 0 ? (
              <p className={styles.empty}>준비 중인 항목입니다.</p>
            ) : (
              questions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  className={styles.questionRow}
                  onClick={() => onOpenQuestion(question.id)}
                >
                  <span className={styles.questionTitle}>{question.title}</span>
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

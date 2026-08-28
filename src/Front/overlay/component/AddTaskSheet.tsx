import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { Segment } from "@/Front/common/component/Segment";
import { TextField } from "@/Front/common/component/TextField";
import type { DueOption, TaskPhase } from "@/Front/common/types/domain";
import styles from "./AddTaskSheet.module.css";

export interface AddTaskSheetProps {
  title: string;
  onTitleChange: (title: string) => void;
  phase: TaskPhase;
  onPhaseChange: (phase: TaskPhase) => void;
  due: DueOption;
  onDueChange: (due: DueOption) => void;
  dueOptions: DueOption[];
  onSubmit: () => void;
  onClose: () => void;
}

const PHASE_OPTIONS: { value: TaskPhase; label: string }[] = [
  { value: "pre", label: "출국 전" },
  { value: "post", label: "현지 정착" },
];

/** 할 일 추가 시트. 제목이 비어 있으면(공백만 있어도) 등록 버튼을 비활성 상태로 둔다(discussion.md 5.1절). */
export function AddTaskSheet({
  title,
  onTitleChange,
  phase,
  onPhaseChange,
  due,
  onDueChange,
  dueOptions,
  onSubmit,
  onClose,
}: AddTaskSheetProps) {
  const canSubmit = title.trim().length > 0;

  return (
    <BottomSheet
      titleId="add-task-sheet-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.submit} disabled={!canSubmit} onClick={onSubmit}>
            등록하기
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
        </>
      }
    >
      <div className={styles.heading}>
        <h2 id="add-task-sheet-title" className={styles.headingTitle}>
          할 일 추가
        </h2>
        <p className={styles.headingDescription}>제목만 있어도 등록됩니다.</p>
      </div>

      <TextField
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="예: 국제운전면허증 발급"
        aria-label="할 일 제목"
      />

      <div className={styles.group}>
        <p className={styles.groupLabel}>언제 할 일인가요?</p>
        <Segment options={PHASE_OPTIONS} value={phase} onChange={onPhaseChange} aria-label="출국 전 또는 현지 정착 선택" />
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>마감</p>
        <div className={styles.dueOptions}>
          {dueOptions.map((option) => {
            const selected = option === due;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                className={[styles.dueOption, selected ? styles.dueOptionSelected : ""].filter(Boolean).join(" ")}
                onClick={() => onDueChange(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { Segment } from "@/Front/common/component/Segment";
import { TextField } from "@/Front/common/component/TextField";
import { openDatePicker } from "@/Front/common/dom/openDatePicker";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import type { DueOption, Task, TaskPhase } from "@/Front/common/types/domain";
import styles from "./AddTaskSheet.module.css";

/* discussion.md 20.12절: BottomSheet 나가는 애니메이션(모바일·태블릿 0.34s)이 다 돌 시간을 준다. */
const CLOSE_ANIMATION_MS = 340;

export interface AddTaskSheetProps {
  title: string;
  onTitleChange: (title: string) => void;
  phase: TaskPhase;
  onPhaseChange: (phase: TaskPhase) => void;
  due: DueOption;
  onDueChange: (due: DueOption) => void;
  dueOptions: DueOption[];
  dueDate: string;
  onDueDateChange: (dueDate: string) => void;
  /** discussion.md 20.13절 8번: 과거 날짜를 고를 수 없게 하는 오늘 날짜(client effect에서만
   *  계산됨, P-06과 같은 함정). 아직 계산 전(null)이면 min을 걸지 않는다. */
  minDate: string | null;
  /** discussion.md 23.2절: 현재 phase·국가에 맞고 아직 목록에 없는 조사된 할 일. 비어 있으면
   *  이 시트는 추천 영역을 아예 그리지 않는다(빈 자리·대체 문구 없음). */
  recommendedTasks: Task[];
  /** discussion.md 23.3절: 추천 하나를 고르면 즉시 이용자의 할 일이 된다 — 시트는 닫지 않고
   *  그대로 두어 여러 개를 이어서 고를 수 있다(23.6절: 추천을 전부 추가하면 영역이 사라진다). */
  onPickRecommended: (task: Task) => void;
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
  dueDate,
  onDueDateChange,
  minDate,
  recommendedTasks,
  onPickRecommended,
  onSubmit,
  onClose,
}: AddTaskSheetProps) {
  const canSubmit = title.trim().length > 0;
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);

  return (
    <BottomSheet
      titleId="add-task-sheet-title"
      closing={closing}
      onRequestClose={requestClose}
      footer={
        <>
          <button type="button" className={styles.submit} disabled={!canSubmit} onClick={onSubmit}>
            등록하기
          </button>
          <button type="button" className={styles.cancel} onClick={requestClose}>
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

      {/* discussion.md 23.2절: 추천이 하나도 없으면(모두 이미 목록에 있거나 이 phase·국가에
          조사된 항목이 없으면) 영역 자체를 그리지 않는다. */}
      {recommendedTasks.length > 0 ? (
        <div className={styles.group}>
          <p className={styles.groupLabel}>추천</p>
          <div className={styles.recommendedList}>
            {recommendedTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={styles.recommendedRow}
                onClick={() => onPickRecommended(task)}
                aria-label={`${task.title} 추천에서 추가하기`}
              >
                <span className={styles.recommendedTitle}>{task.title}</span>
                <span className={styles.recommendedAdd} aria-hidden="true">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.group}>
        <p className={styles.groupLabel}>마감</p>
        <div className={styles.dueOptions}>
          {dueOptions.map((option) => {
            // discussion.md 19.3절: 날짜를 직접 고르면 그 값이 우선이라, 고정 선택지 중 어느 것도
            // 선택 표시하지 않는다(둘이 동시에 선택된 것처럼 보이면 어느 쪽이 실제 마감인지 헷갈린다).
            const selected = option === due && !dueDate;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                className={[styles.dueOption, selected ? styles.dueOptionSelected : ""].filter(Boolean).join(" ")}
                onClick={() => {
                  onDueChange(option);
                  onDueDateChange("");
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className={styles.dueDateLabel}>또는 날짜 직접 선택</p>
        {/* discussion.md 20.11절: 오른쪽 달력 아이콘만이 아니라 칸 전체를 눌러도 달력이 열려야
            한다 — 네이티브 날짜 입력은 포커스만으로는 달력을 열지 않아 showPicker()를 직접 호출한다. */}
        {/* discussion.md 20.13절 8번: 과거 날짜는 고를 수 없다(min=오늘). 출국일 입력에는
            적용하지 않는다 — 이미 출국한 사람은 과거 날짜를 넣어야 하기 때문이다. */}
        <TextField
          type="date"
          value={dueDate}
          min={minDate ?? undefined}
          onChange={(event) => onDueDateChange(event.target.value)}
          onClick={(event) => openDatePicker(event.currentTarget)}
          aria-label="마감 날짜 직접 선택"
        />
      </div>
    </BottomSheet>
  );
}

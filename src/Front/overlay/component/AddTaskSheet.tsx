import { useState } from "react";
import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { Segment } from "@/Front/common/component/Segment";
import { SourceLink } from "@/Front/common/component/SourceLink";
import { TextField } from "@/Front/common/component/TextField";
import { openDatePicker } from "@/Front/common/dom/openDatePicker";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import type { Task, TaskPhase } from "@/Front/common/types/domain";
import styles from "./AddTaskSheet.module.css";

/* discussion.md 20.12절: BottomSheet 나가는 애니메이션(모바일·태블릿 0.34s)이 다 돌 시간을 준다. */
const CLOSE_ANIMATION_MS = 340;

export interface AddTaskSheetProps {
  title: string;
  onTitleChange: (title: string) => void;
  phase: TaskPhase;
  onPhaseChange: (phase: TaskPhase) => void;
  dueDate: string;
  onDueDateChange: (dueDate: string) => void;
  /** discussion.md 20.13절 8번: 과거 날짜를 고를 수 없게 하는 오늘 날짜(client effect에서만
   *  계산됨, P-06과 같은 함정). 아직 계산 전(null)이면 min을 걸지 않는다. */
  minDate: string | null;
  /** discussion.md 23.2절: 현재 phase·국가에 맞고 아직 목록에 없는 조사된 할 일. 비어 있으면
   *  이 시트는 추천 영역을 아예 그리지 않는다(빈 자리·대체 문구 없음). */
  recommendedTasks: Task[];
  /** discussion.md 25.3절: 지금 골라진 추천의 id(제목·phase를 직접 고치면 null로 풀린다). */
  selectedRecommendationId: string | null;
  /** discussion.md 25.1절/25.3절: 추천을 누르면 제목칸만 채운다 — 목록에는 등록하기를 눌러야
   *  들어간다(등록 경로는 하나뿐이다). */
  onSelectRecommended: (task: Task) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const PHASE_OPTIONS: { value: TaskPhase; label: string }[] = [
  { value: "pre", label: "출국 전" },
  { value: "post", label: "현지 정착" },
];

/**
 * 할 일 추가 시트. 제목이 비어 있으면(공백만 있어도) 등록 버튼을 비활성 상태로 둔다(discussion.md 5.1절).
 *
 * discussion.md 25.2절: 제목 입력 → 추천 → 언제 할 일인가요 → 마감(날짜 직접 선택만) → 등록하기/
 * 취소 순서다. 등록하는 길은 등록하기 하나뿐이다 — 추천은 제목을 채우는 보조 수단일 뿐 별도의
 * 등록 경로가 아니다(25.1절).
 */
export function AddTaskSheet({
  title,
  onTitleChange,
  phase,
  onPhaseChange,
  dueDate,
  onDueDateChange,
  minDate,
  recommendedTasks,
  selectedRecommendationId,
  onSelectRecommended,
  onSubmit,
  onClose,
}: AddTaskSheetProps) {
  const canSubmit = title.trim().length > 0;
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);
  // discussion.md 25.7절: "!" 버튼은 자료를 펼쳐 보여줄 뿐 고르는 것이 아니다 — 시트 위에
  // 또 시트를 띄우지 않고 그 항목 바로 아래에 펼친다. 한 번에 하나만, 같은 것을 다시 누르면 접힌다.
  // 이 상태는 고른 항목(selectedRecommendationId, 훅에 있음)과 다른 순수 UI 상태라 이 컴포넌트
  // 안에서만 관리한다.
  const [expandedRecommendationId, setExpandedRecommendationId] = useState<string | null>(null);

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

      {/* discussion.md 23.2절: 추천이 하나도 없으면(모두 이미 목록에 있거나 이 phase·국가에
          조사된 항목이 없으면) 영역 자체를 그리지 않는다.
          discussion.md 25.4-1절/25.7절: 보이는 소제목("추천")은 없애고 화면 낭독기용 이름만
          남긴다 — 눈으로 보지 않는 이용자도 이 버튼 묶음이 무엇인지 알 수 있어야 한다. 제목
          입력과의 간격은 좁혀 붙듯이 두되 맞닿지는 않게 한다(recommendedGroup의 margin-top) —
          추천이 제목을 채우는 보조 수단이라는 관계가 거리로 드러나야 한다. */}
      {recommendedTasks.length > 0 ? (
        <div className={styles.recommendedGroup} role="group" aria-label="추천">
          <div className={styles.recommendedList}>
            {recommendedTasks.map((task) => {
              const selected = task.id === selectedRecommendationId;
              const expanded = task.id === expandedRecommendationId;
              const hasDetail = !!task.body || task.items.length > 0 || !!task.sourceUrl;
              return (
                <div key={task.id} className={styles.recommendedItem}>
                  <div
                    className={[styles.recommendedRow, selected ? styles.recommendedRowSelected : ""]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* discussion.md 25.7절: 제목 부분을 누르면 25.3절대로 제목칸을 채운다 —
                        고르는 동작이다. */}
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={styles.recommendedTitleButton}
                      onClick={() => onSelectRecommended(task)}
                      aria-label={selected ? `${task.title} 선택됨` : `${task.title} 추천에서 제목 채우기`}
                    >
                      <span className={styles.recommendedTitle}>{task.title}</span>
                    </button>
                    {/* discussion.md 25.7절: "!" 버튼은 조사해 둔 자료를 펼쳐 보여줄 뿐 고르는
                        것이 아니다 — 눌러도 제목·phase가 바뀌지 않는다. +는 "누르면 추가된다"는
                        뜻이라 등록 경로가 하나뿐인 25절 흐름과 맞지 않아 없앴다. !는 경고가
                        아니라 읽을 거리 표시라 --alert 색을 쓰지 않는다. */}
                    {hasDetail ? (
                      <button
                        type="button"
                        className={styles.recommendedInfoButton}
                        aria-label={`${task.title} 자료 보기`}
                        aria-expanded={expanded}
                        onClick={() => setExpandedRecommendationId((prev) => (prev === task.id ? null : task.id))}
                      >
                        !
                      </button>
                    ) : null}
                  </div>
                  {expanded ? (
                    <div className={styles.recommendedDetail}>
                      {task.body ? <p className={styles.recommendedDetailBody}>{task.body}</p> : null}
                      {task.items.length > 0 ? (
                        <div className={styles.recommendedDetailItems}>
                          {task.items.map((item, index) => (
                            <div key={index} className={styles.recommendedDetailItem}>
                              <span className={styles.recommendedDetailItemDot} aria-hidden="true" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <SourceLink url={task.sourceUrl} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={styles.group}>
        <p className={styles.groupLabel}>언제 할 일인가요?</p>
        <Segment options={PHASE_OPTIONS} value={phase} onChange={onPhaseChange} aria-label="출국 전 또는 현지 정착 선택" />
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>마감</p>
        {/* discussion.md 25.5절: 고정 선택지(오늘까지/이번 주/이번 달/도착 후)를 없애고 날짜
            직접 선택만 남긴다 — 마감은 선택 사항이라 비워 둔 채 등록할 수 있다. */}
        {/* discussion.md 20.11절: 오른쪽 달력 아이콘만이 아니라 칸 전체를 눌러도 달력이 열려야
            한다 — 네이티브 날짜 입력은 포커스만으로는 달력을 열지 않아 showPicker()를 직접 호출한다. */}
        {/* discussion.md 20.13절 8번/25.5절: 과거 날짜는 고를 수 없다(min=오늘) — 출국일과
            혼동하지 않는다. 출국일은 24.4절대로 과거를 허용한다(min을 걸지 않는다). */}
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

import { ListRow } from "@/Front/common/component/ListRow";
import { ProgressBar } from "@/Front/common/component/ProgressBar";
import { Segment } from "@/Front/common/component/Segment";
import type { Task, TaskPhase } from "@/Front/common/types/domain";
import styles from "./TasksScreen.module.css";

export interface TasksScreenProps {
  phase: TaskPhase;
  onPhaseChange: (phase: TaskPhase) => void;
  phaseTasks: Task[];
  phaseDoneCount: number;
  done: Record<string, boolean>;
  onToggleTask: (id: string) => void;
  /** discussion.md 27.1절/27.3절: 목록 행은 더 이상 상세를 열지 않는다(토글만) — 상세는
   *  홈의 다음 할 일 카드에서만 연다. discussion.md 27.2절: 상세로 가는 길이 없어지며 끊긴
   *  삭제 경로를 행 자체의 삭제 버튼으로 되살린다(확인 시트는 호출부가 연다). */
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
}

const PHASE_OPTIONS: { value: TaskPhase; label: string }[] = [
  { value: "pre", label: "출국 전" },
  { value: "post", label: "현지 정착" },
];

/** 할 일 화면. 완료 항목도 목록에서 지우지 않고 흐리게 남겨 진행감을 준다(discussion.md 5절). */
export function TasksScreen({
  phase,
  onPhaseChange,
  phaseTasks,
  phaseDoneCount,
  done,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
}: TasksScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>할 일</h1>
        <button type="button" className={styles.addButton} onClick={onOpenAddTask} aria-label="할 일 추가">
          <span aria-hidden="true" className={styles.plusVertical} />
          <span aria-hidden="true" className={styles.plusHorizontal} />
        </button>
      </header>

      <Segment options={PHASE_OPTIONS} value={phase} onChange={onPhaseChange} aria-label="출국 전 또는 현지 정착 선택" />

      <div className={styles.progressRow}>
        <div className={styles.progressLabelRow}>
          <span>{phase === "pre" ? "출국 전 준비" : "현지 정착"}</span>
          <span className={styles.progressValue}>
            {phaseDoneCount} / {phaseTasks.length}
          </span>
        </div>
        <ProgressBar value={phaseDoneCount} max={phaseTasks.length} />
      </div>

      <div className={styles.list}>
        {phaseTasks.length === 0 ? (
          // discussion.md 23.4절: 새 화면이나 안내 카드를 만들지 않고, 기존 빈 상태 문구에
          // 무엇을 하면 되는지 한 줄만 더한다.
          <p className={styles.empty}>등록된 할 일이 없습니다. 오른쪽 위 + 버튼으로 추천에서 고르거나 직접 추가해 보세요.</p>
        ) : (
          phaseTasks.map((task) => (
            <ListRow
              key={task.id}
              title={task.title}
              meta={done[task.id] ? "완료" : task.meta}
              done={!!done[task.id]}
              urgent={!!task.urgent && !done[task.id]}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

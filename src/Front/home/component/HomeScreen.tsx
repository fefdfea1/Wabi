import { ListRow } from "@/Front/common/component/ListRow";
import { NextActionCard } from "@/Front/common/component/NextActionCard";
import { ProgressBar } from "@/Front/common/component/ProgressBar";
import type { Task } from "@/Front/common/types/domain";
import { formatDDay } from "@/Front/app-shell/state/wabiLogic";
import styles from "./HomeScreen.module.css";

export interface HomeScreenProps {
  countryLabel: string | null;
  dday: number | null;
  doneCount: number;
  total: number;
  nextTask: Task | null;
  nextDescription: string;
  weekTasks: Task[];
  done: Record<string, boolean>;
  painCount: number;
  onToggleTask: (id: string) => void;
  /** discussion.md 27.2절: 목록 행의 삭제 버튼이 누르는 확인 시트를 연다. */
  onDeleteTask: (id: string) => void;
  onOpenPain: () => void;
  onGoTasks: () => void;
}

const HOME_WEEK_LIMIT = 3;

/**
 * 홈 화면. 시선 순서를 상태(D-day/진행률) → 다음 행동(NEXT) → 목록(이번 주 할 일) → 탭바로 고정한다.
 * 태블릿(744~1179px)은 헤더가 Wabi 텍스트 + 국가 필로 단순해지고(로고·가이드 버튼은 레일에
 * 이미 있어 중복 표시하지 않는다), 데스크톱(1180px+)은 헤더 자체가 사라진다(사이드바가 대신한다)
 * — 캔버스 06절. 데스크톱 우측 336px 패널(NotesPanel)은 discussion.md 20.1절/20.2절에 따라
 * WabiApp 셸 레벨에서 탭에 따라 열고 닫는다 — 이 화면 자신은 더 이상 그 패널을 소유하지 않는다.
 */
export function HomeScreen({
  countryLabel,
  dday,
  doneCount,
  total,
  nextTask,
  nextDescription,
  weekTasks,
  done,
  painCount,
  onToggleTask,
  onDeleteTask,
  onOpenPain,
  onGoTasks,
}: HomeScreenProps) {
  const visibleWeekTasks = weekTasks.slice(0, HOME_WEEK_LIMIT);

  return (
    <div className={styles.screen}>
      {/* discussion.md 20.7절: 다른 세 화면은 각각 h1(할 일/메모/프로필)이 있는데 홈만 없어서
          스크린리더로 훑을 때 위치를 못 잡는다. 시각적으로 큰 제목을 새로 넣지 않고(정보 예산
          유지), 화면 제목을 sr-only h1로만 둔다 — discussion.md 20.13절 7번: 헤더(브랜드·가이드·
          국가 전환)는 이제 이 화면 소유가 아니라 WabiApp 셸의 AppHeader가 모든 탭에 공용으로
          띄운다. */}
      <h1 className={styles.srOnlyTitle}>홈</h1>

      <section className={styles.statusBlock}>
        {/* discussion.md 19.5절: 캡션+숫자는 세로 블록(gap:10)이고, 그 블록이 진행률과 나란히
            가로 행을 이룬다(바깥 statusBlock: align-items:flex-end, gap). 이 중첩이 없으면
            태블릿·데스크톱에서 88px 숫자가 캡션에 밀려 위치가 어긋난다. */}
        <div className={styles.ddayBlock}>
          <p className={styles.ddayCaption}>{countryLabel ? `${countryLabel} 출국까지` : "출국까지"}</p>
          {/* discussion.md 10.2절(2026-08-28 갱신): 출국일이 없으면 D-0을 기본값으로 보여준다 —
              첫 화면이 비어 보이지 않게 하려는 표시일 뿐, 실제 출국 당일에 나오는 D-DAY와는
              다른 표기이니 섞지 않는다. */}
          <p className={styles.ddayLabel}>{dday !== null ? formatDDay(dday) : "D-0"}</p>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressLabelRow}>
            <span>준비 진행률</span>
            <span className={styles.progressValue}>
              {doneCount} / {total}
            </span>
          </div>
          <ProgressBar value={doneCount} max={total} ariaLabel="준비 진행률" />
        </div>
      </section>

      {nextTask ? (
        <NextActionCard
          title={nextTask.title}
          description={nextDescription}
          dueLabel={nextTask.meta}
          urgent={!!nextTask.urgent}
        />
      ) : (
        <p className={styles.emptyNext}>아직 등록된 할 일이 없습니다.</p>
      )}

      <section className={styles.weekBlock}>
        <div className={styles.weekHeader}>
          <h2 className={styles.weekTitle}>이번 주 할 일</h2>
          <button type="button" className={styles.linkButton} onClick={onGoTasks}>
            전체 보기 ›
          </button>
        </div>
        {visibleWeekTasks.length === 0 ? (
          <p className={styles.emptyList}>이번 주 할 일이 없습니다.</p>
        ) : (
          <div>
            {visibleWeekTasks.map((task) => (
              <ListRow
                key={task.id}
                title={task.title}
                meta={done[task.id] ? "완료" : task.meta}
                done={!!done[task.id]}
                urgent={!!task.urgent && !done[task.id]}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </section>

      <button type="button" className={styles.painBlock} onClick={onOpenPain}>
        <span className={styles.painTexts}>
          <span className={styles.painTitle}>먼저 간 사람들이 힘들어한 것</span>
          <span className={styles.painMeta}>
            {/* discussion.md 28절: 개수를 세어 보여주지 않고 항상 같은 문구를 쓴다. */}
            {painCount > 0 ? "자주 나온 어려움" : "정리하는 대로 보여드립니다"}
          </span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  );
}

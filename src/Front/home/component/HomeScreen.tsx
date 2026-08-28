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
  onOpenDetail: (id: string) => void;
  onOpenGuide: () => void;
  onOpenPain: () => void;
  onGoTasks: () => void;
}

const HOME_WEEK_LIMIT = 3;

/** 홈 화면. 시선 순서를 상태(D-day/진행률) → 다음 행동(NEXT) → 목록(이번 주 할 일) → 탭바로 고정한다. */
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
  onOpenDetail,
  onOpenGuide,
  onOpenPain,
  onGoTasks,
}: HomeScreenProps) {
  const visibleWeekTasks = weekTasks.slice(0, HOME_WEEK_LIMIT);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            W
          </span>
          <span className={styles.brandName}>Wabi</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.guideButton} onClick={onOpenGuide} aria-label="가이드 열기">
            <svg width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="13" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="3.5" y1="5.5" x2="11.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
              <line x1="3.5" y1="9" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </button>
          {countryLabel ? <span className={styles.countryBadge}>{countryLabel} ▾</span> : null}
        </div>
      </header>

      <section className={styles.statusBlock}>
        {dday !== null ? (
          <>
            <p className={styles.ddayCaption}>{countryLabel ? `${countryLabel} 출국까지` : "출국까지"}</p>
            <p className={styles.ddayLabel}>{formatDDay(dday)}</p>
          </>
        ) : (
          <p className={styles.ddayEmpty}>&apos;나&apos; 화면에서 출국일을 입력하면 D-day가 표시됩니다.</p>
        )}
        <div className={styles.progressRow}>
          <div className={styles.progressLabelRow}>
            <span>준비 진행률</span>
            <span className={styles.progressValue}>
              {doneCount} / {total}
            </span>
          </div>
          <ProgressBar value={doneCount} max={total} />
        </div>
      </section>

      {nextTask ? (
        <NextActionCard
          title={nextTask.title}
          description={nextDescription}
          ctaLabel="지금 하기"
          onAction={() => onOpenDetail(nextTask.id)}
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
                onOpen={() => onOpenDetail(task.id)}
              />
            ))}
          </div>
        )}
      </section>

      <button type="button" className={styles.painBlock} onClick={onOpenPain}>
        <span className={styles.painTexts}>
          <span className={styles.painTitle}>먼저 간 사람들이 힘들어한 것</span>
          <span className={styles.painMeta}>
            {painCount > 0 ? `자주 나온 어려움 ${painCount}가지와 대처법` : "정리하는 대로 보여드립니다"}
          </span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  );
}

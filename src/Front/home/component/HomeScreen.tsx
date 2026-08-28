"use client";

import { useState } from "react";
import { ListRow } from "@/Front/common/component/ListRow";
import { NextActionCard } from "@/Front/common/component/NextActionCard";
import { ProgressBar } from "@/Front/common/component/ProgressBar";
import type { NoteRecord, Task } from "@/Front/common/types/domain";
import { formatDDay } from "@/Front/app-shell/state/wabiLogic";
import { formatShortDate } from "@/Front/common/date/localDate";
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
  notes: NoteRecord[];
  onToggleTask: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenGuide: () => void;
  onOpenPain: () => void;
  onGoTasks: () => void;
  onOpenCountryPicker: () => void;
  onOpenAddNote: () => void;
  onOpenEditNote: (id: string) => void;
  onQuickAddNote: (body: string) => void;
}

const HOME_WEEK_LIMIT = 3;

function firstLine(text: string): string {
  const [line] = text.split("\n");
  return line;
}

/** 메모의 제목·본문 미리보기 — title이 비어 있으면 본문 첫 줄이 제목 역할을 한다(domain.ts 참고). */
function noteHeading(note: NoteRecord): string {
  return note.title.trim() || firstLine(note.body);
}

/** title이 있을 때만 본문 첫 줄을 부제로 따로 보여준다 — title이 없으면 이미 제목 자리에 쓰인 줄이라 중복 표시하지 않는다. */
function noteSubtitle(note: NoteRecord): string {
  return note.title.trim() ? firstLine(note.body) : "";
}

/**
 * 홈 화면. 시선 순서를 상태(D-day/진행률) → 다음 행동(NEXT) → 목록(이번 주 할 일) → 탭바로 고정한다.
 * 태블릿(744~1179px)은 헤더가 Wabi 텍스트 + 국가 필로 단순해지고(로고·가이드 버튼은 레일에
 * 이미 있어 중복 표시하지 않는다), 데스크톱(1180px+)은 헤더 자체가 사라진다(사이드바가 대신한다)
 * — 캔버스 06절. 데스크톱에만 우측 336px 패널이 붙는데, 다른 화면에 이미 있는 정보(메모·어려움)를
 * 옮겨 놓은 것뿐이라 "정보를 추가하지 않는다" 확장 규칙에 맞는다.
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
  notes,
  onToggleTask,
  onOpenDetail,
  onOpenGuide,
  onOpenPain,
  onGoTasks,
  onOpenCountryPicker,
  onOpenAddNote,
  onOpenEditNote,
  onQuickAddNote,
}: HomeScreenProps) {
  const visibleWeekTasks = weekTasks.slice(0, HOME_WEEK_LIMIT);
  const [quickDraft, setQuickDraft] = useState("");

  function submitQuickDraft() {
    const trimmed = quickDraft.trim();
    if (!trimmed) return;
    onQuickAddNote(trimmed);
    setQuickDraft("");
  }

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
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
            {countryLabel ? (
              <button type="button" className={styles.countryBadge} onClick={onOpenCountryPicker}>
                {countryLabel} ▾
              </button>
            ) : null}
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

      {/* 데스크톱(1180px+) 전용 우측 336px 패널 — 캔버스 06절/11.5절. 메모·어려움 모두
          홈·메모·나 화면에 이미 있는 내용을 옮겨 놓은 것뿐이다. */}
      <aside className={styles.rightPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>내 메모</span>
          <button type="button" className={styles.panelAddButton} onClick={onOpenAddNote}>
            + 새 메모
          </button>
        </div>
        <textarea
          className={styles.quickNote}
          placeholder="여기에 바로 적어 두세요"
          value={quickDraft}
          onChange={(event) => setQuickDraft(event.target.value)}
          onBlur={submitQuickDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitQuickDraft();
            }
          }}
        />
        <div className={styles.panelNoteList}>
          {notes.length === 0 ? (
            <p className={styles.panelEmpty}>아직 적어 둔 메모가 없습니다.</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={styles.panelNoteRow}
                onClick={() => onOpenEditNote(note.id)}
              >
                <span className={styles.panelNoteTexts}>
                  <span className={styles.panelNoteName}>{noteHeading(note)}</span>
                  {noteSubtitle(note) ? (
                    <span className={styles.panelNoteSub}>{noteSubtitle(note)}</span>
                  ) : null}
                </span>
                <span className={styles.panelNoteDate}>{formatShortDate(note.updatedAt)}</span>
              </button>
            ))
          )}
        </div>
        <button type="button" className={styles.panelPainCard} onClick={onOpenPain}>
          <span className={styles.panelPainTitle}>먼저 간 사람들이 힘들어한 것</span>
          <span className={styles.panelPainMeta}>
            {painCount > 0 ? `자주 나온 어려움 ${painCount}가지 ›` : "정리하는 대로 보여드립니다 ›"}
          </span>
        </button>
      </aside>
    </div>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";
import type { NoteRecord } from "@/Front/common/types/domain";
import { formatShortDate } from "@/Front/common/date/localDate";
import styles from "./NotesPanel.module.css";

export interface NotesPanelProps {
  /**
   * discussion.md 20.1절/20.2절: 우측 패널은 화면(탭)에 따라 자동으로 접히고 펼쳐진다 —
   * 사용자가 손으로 접고 펴는 토글이 아니다. 홈 탭에서는 펼치고, 그 외(할 일·메모·나)에서는
   * 접는다. 메모 화면은 본문이 이미 같은 기능(목록+입력)을 담고 있어 우측에 또 두면 중복이다.
   */
  collapsed: boolean;
  notes: NoteRecord[];
  onQuickAdd: (body: string) => void;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** discussion.md 19.7절: 홈에만 붙는 하단(margin-top: auto) 요소. 그 한 가지만 다르고 나머지는 동일하다. */
  footer?: ReactNode;
}

function firstLine(text: string): string {
  const [line] = text.split("\n");
  return line;
}

/**
 * discussion.md 19.7절(사용자 지시): 홈과 메모의 데스크톱 우측 336px 패널을 하나의 컴포넌트로
 * 합쳤다. 제목 입력칸 없이 본문만 적고 저장하기 한 번으로 등록한다(모달을 띄우지 않는다,
 * 19.2절). 목록 행에 마우스를 올리면 삭제 아이콘이 나타난다(19.4절, 데스크톱 전용 패널이라
 * hover만으로 충분하다).
 *
 * discussion.md 20.1절/20.2절: WabiApp 셸 레벨에 항상 하나만 마운트해 두고 `collapsed`
 * prop(현재 탭이 홈인지)으로 폭만 애니메이션한다 — 탭을 옮길 때마다 이 컴포넌트를 통째로
 * 마운트/언마운트하면 폭이 뚝 끊기지만, 하나를 계속 유지하고 width만 transition을 걸면
 * 236 ↔ 88 사이드바처럼 부드럽게 닫히고 열린다.
 */
export function NotesPanel({ collapsed, notes, onQuickAdd, onOpenEdit, onDelete, footer }: NotesPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const canSave = draft.trim().length > 0;

  function submit() {
    if (!canSave) return;
    onQuickAdd(draft);
    setDraft("");
  }

  return (
    <aside className={[styles.panel, collapsed ? styles.collapsed : ""].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <span className={styles.title}>내 메모</span>
        <textarea
          ref={textareaRef}
          className={styles.body}
          placeholder="여기에 바로 적어 두세요"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <button type="button" className={styles.save} disabled={!canSave} onClick={submit}>
          저장하기
        </button>
        <div className={styles.list}>
          {notes.length === 0 ? (
            <p className={styles.empty}>아직 적어 둔 메모가 없습니다.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className={styles.rowWrap}>
                <button type="button" className={styles.row} onClick={() => onOpenEdit(note.id)}>
                  <span className={styles.name}>{firstLine(note.body)}</span>
                  <span className={styles.date}>{formatShortDate(note.updatedAt)}</span>
                </button>
                <button
                  type="button"
                  className={styles.delete}
                  aria-label="메모 삭제하기"
                  onClick={() => onDelete(note.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 4h10M6.5 4V2.5h3V4M4.5 4v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        {footer}
      </div>
    </aside>
  );
}

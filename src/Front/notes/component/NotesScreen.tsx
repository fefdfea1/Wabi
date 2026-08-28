import { formatMonthDay } from "@/Front/common/date/localDate";
import type { NoteRecord } from "@/Front/common/types/domain";
import styles from "./NotesScreen.module.css";

export interface NotesScreenProps {
  notes: NoteRecord[];
  onOpenAdd: () => void;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** discussion.md 16.3절: 목록에서 본문 첫 줄이 제목 역할을 한다. */
function firstLine(body: string): string {
  const [line] = body.split("\n");
  return line;
}

function metaText(note: NoteRecord): string {
  const label = formatMonthDay(note.updatedAt);
  return label ? `수정 ${label}` : "";
}

/** 메모 화면. ListRow 규격(행 높이 64px)을 따르는 목록 + BottomSheet 추가·편집(discussion.md 16절). */
export function NotesScreen({ notes, onOpenAdd, onOpenEdit, onDelete }: NotesScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>메모</h1>
        <button type="button" className={styles.addButton} onClick={onOpenAdd} aria-label="메모 추가">
          <span aria-hidden="true" className={styles.plusVertical} />
          <span aria-hidden="true" className={styles.plusHorizontal} />
        </button>
      </header>

      <p className={styles.notice}>기억해 둘 것을 적어 두세요. 이 기기에만 저장됩니다.</p>

      <div className={styles.list}>
        {notes.length === 0 ? (
          <p className={styles.empty}>아직 적어 둔 메모가 없습니다.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={styles.row}>
              <button type="button" className={styles.rowMain} onClick={() => onOpenEdit(note.id)}>
                <span className={styles.texts}>
                  <span className={styles.name}>{firstLine(note.body)}</span>
                  <span className={styles.meta}>{metaText(note)}</span>
                </span>
                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                aria-label="메모 삭제하기"
                onClick={() => onDelete(note.id)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    </div>
  );
}

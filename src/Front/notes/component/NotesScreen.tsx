import { formatMonthDay } from "@/Front/common/date/localDate";
import type { NoteRecord } from "@/Front/common/types/domain";
import styles from "./NotesScreen.module.css";

export interface NotesScreenProps {
  notes: NoteRecord[];
  onOpenAdd: () => void;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** discussion.md 16.3절 / 19.7절: 목록에서 본문 첫 줄이 제목 역할을 한다(레코드에 title이 없다). */
function firstLine(body: string): string {
  const [line] = body.split("\n");
  return line;
}

function metaText(note: NoteRecord): string {
  const label = formatMonthDay(note.updatedAt);
  return label ? `수정 ${label}` : "";
}

/**
 * 메모 화면. 모바일은 ListRow 규격을 따르는 단순 목록(discussion.md 16절). 태블릿(744~1179px)은
 * 카드 2열 그리드로 바뀐다. discussion.md 20.1절: 데스크톱에서도 우측 336px 패널을 쓰지 않는다
 * (본문이 이미 목록+입력을 담고 있어 중복이다) — 단일 열 목록만 조금 넓어질 뿐이다. "+ 새 메모"는
 * 언제나 시트를 연다(우측 패널이 아예 없으니 분기할 대상도 없다).
 */
export function NotesScreen({ notes, onOpenAdd, onOpenEdit, onDelete }: NotesScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>메모</h1>
          <p className={styles.intro}>
            계좌 번호, 집주인 연락처, 병원 이름처럼 잊으면 곤란한 것을 적어 두는 곳입니다.
          </p>
        </div>
        <button type="button" className={styles.addButton} onClick={onOpenAdd} aria-label="메모 추가">
          <span aria-hidden="true" className={styles.plusVertical} />
          <span aria-hidden="true" className={styles.plusHorizontal} />
          <span className={styles.addLabel}>+ 새 메모</span>
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

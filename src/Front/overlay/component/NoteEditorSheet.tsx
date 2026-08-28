import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { TextArea } from "@/Front/common/component/TextArea";
import { TextField } from "@/Front/common/component/TextField";
import styles from "./NoteEditorSheet.module.css";

export interface NoteEditorSheetProps {
  isEditing: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * discussion.md 16.3절 / 캔버스 06절: 추가·편집 모두 BottomSheet 안에서 한다. 제목은 선택
 * 입력이다 — 비어 있으면 목록에서 본문 첫 줄을 제목처럼 보여준다(NotesScreen 참고).
 */
export function NoteEditorSheet({ isEditing, title, onTitleChange, body, onBodyChange, onSave, onClose }: NoteEditorSheetProps) {
  const canSave = body.trim().length > 0;

  return (
    <BottomSheet
      titleId="note-editor-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.submit} disabled={!canSave} onClick={onSave}>
            저장하기
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
        </>
      }
    >
      <div className={styles.heading}>
        <h2 id="note-editor-title" className={styles.headingTitle}>
          {isEditing ? "메모 편집" : "메모 추가"}
        </h2>
        {/* discussion.md 16.4절 / SecurityReview.md 9절: 평문 저장이라 막을 수는 없으니 알려준다. */}
        <p className={styles.hint}>계좌번호나 여권번호처럼 민감한 정보는 적지 않기를 권합니다.</p>
      </div>
      <TextField
        aria-label="메모 제목"
        placeholder="제목 (예: 집주인 연락처)"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <TextArea
        autoFocus
        aria-label="메모 내용"
        placeholder="기억해 둘 것을 적어 두세요."
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
      />
    </BottomSheet>
  );
}

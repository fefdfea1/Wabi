import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { TextArea } from "@/Front/common/component/TextArea";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import styles from "./NoteEditorSheet.module.css";

/* discussion.md 20.12절: BottomSheet 나가는 애니메이션(모바일·태블릿 0.34s)이 다 돌 시간을 준다. */
const CLOSE_ANIMATION_MS = 340;

export interface NoteEditorSheetProps {
  isEditing: boolean;
  body: string;
  onBodyChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * discussion.md 16.3절 / 19.7절: 추가·편집 모두 BottomSheet 안에서 한다. 제목 입력칸은 없다 —
 * 목록에서는 본문 첫 줄을 제목처럼 보여준다(NotesScreen 참고).
 */
export function NoteEditorSheet({ isEditing, body, onBodyChange, onSave, onClose }: NoteEditorSheetProps) {
  const canSave = body.trim().length > 0;
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);

  return (
    <BottomSheet
      titleId="note-editor-title"
      closing={closing}
      onRequestClose={requestClose}
      footer={
        <>
          <button type="button" className={styles.submit} disabled={!canSave} onClick={onSave}>
            저장하기
          </button>
          <button type="button" className={styles.cancel} onClick={requestClose}>
            취소
          </button>
        </>
      }
    >
      <div className={styles.heading}>
        <h2 id="note-editor-title" className={styles.headingTitle}>
          {isEditing ? "메모 편집" : "메모 추가"}
        </h2>
        <p className={styles.hint}>계좌번호나 여권번호처럼 민감한 정보는 적지 않기를 권합니다.</p>
      </div>
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

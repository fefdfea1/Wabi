import { BottomSheet } from "@/Front/common/component/BottomSheet";
import type { UploadKind } from "@/Front/app-shell/state/useWabiApp";
import styles from "./AddFileSheet.module.css";

export interface AddFileSheetProps {
  onPick: (kind: UploadKind) => void;
  onClose: () => void;
}

const OPTIONS: { kind: UploadKind; tag: string; label: string }[] = [
  { kind: "camera", tag: "CAM", label: "사진 촬영" },
  { kind: "album", tag: "IMG", label: "앨범에서 가져오기" },
  { kind: "file", tag: "PDF", label: "파일에서 선택" },
];

/**
 * 파일 추가 시트. 이번 범위는 실제 카메라/파일 피커 연동 없이(discussion.md 9절 제외 범위)
 * 문서 목록에 플레이스홀더 항목만 추가한다.
 */
export function AddFileSheet({ onPick, onClose }: AddFileSheetProps) {
  return (
    <BottomSheet
      titleId="add-file-sheet-title"
      onClose={onClose}
      footer={
        <button type="button" className={styles.cancel} onClick={onClose}>
          취소
        </button>
      }
    >
      <div className={styles.heading}>
        <h2 id="add-file-sheet-title" className={styles.headingTitle}>
          파일 추가
        </h2>
        <p className={styles.headingDescription}>서류는 기기에만 저장되며 만료일 알림에 사용됩니다.</p>
      </div>
      <div className={styles.optionList}>
        {OPTIONS.map((option) => (
          <button key={option.kind} type="button" className={styles.optionRow} onClick={() => onPick(option.kind)}>
            <span className={styles.optionTag}>{option.tag}</span>
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={styles.chevron} aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

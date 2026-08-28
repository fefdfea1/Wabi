import { BottomSheet } from "@/Front/common/component/BottomSheet";
import { Chip } from "@/Front/common/component/Chip";
import { useClosingTransition } from "@/Front/common/hooks/useClosingTransition";
import type { Country, CountryCode } from "@/Front/common/types/domain";
import styles from "./CountryPickerSheet.module.css";

/* discussion.md 20.12절: BottomSheet 나가는 애니메이션(모바일·태블릿 0.34s)이 다 돌 시간을 준다. */
const CLOSE_ANIMATION_MS = 340;

export interface CountryPickerSheetProps {
  countries: Country[];
  selectedCode: CountryCode | null;
  onSelect: (code: CountryCode) => void;
  onClose: () => void;
}

/**
 * discussion.md 18.1절: 홈 헤더의 국가 표시를 실제로 눌러 바꿀 수 있게 한다. BottomSheet 안에
 * 국가 수만큼 Chip을 두고 선택된 국가만 selected로 표시한다. 고르면 onSelect가 국가를 바꾸고
 * (그 안에서 열려 있던 상세도 함께 닫는다 — '나' 화면의 국가 변경과 같은 selectCountry를 쓴다),
 * 시트도 닫힌다.
 */
export function CountryPickerSheet({ countries, selectedCode, onSelect, onClose }: CountryPickerSheetProps) {
  const { closing, requestClose } = useClosingTransition(onClose, CLOSE_ANIMATION_MS);

  return (
    <BottomSheet
      titleId="country-picker-title"
      closing={closing}
      onRequestClose={requestClose}
      footer={
        <button type="button" className={styles.closeButton} onClick={requestClose}>
          닫기
        </button>
      }
    >
      <div className={styles.heading}>
        <h2 id="country-picker-title" className={styles.headingTitle}>
          국가 변경
        </h2>
      </div>
      <div className={styles.chipList}>
        {countries.length === 0 ? (
          <p className={styles.empty}>등록된 국가가 없습니다.</p>
        ) : (
          countries.map((c) => (
            <Chip key={c.code} label={c.label} selected={c.code === selectedCode} onClick={() => onSelect(c.code)} />
          ))
        )}
      </div>
    </BottomSheet>
  );
}

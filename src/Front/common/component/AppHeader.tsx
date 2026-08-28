import styles from "./AppHeader.module.css";

export interface AppHeaderProps {
  countryLabel: string | null;
  onOpenGuide: () => void;
  onOpenCountryPicker: () => void;
  onGoHome: () => void;
}

/**
 * discussion.md 20.13절 7번: 모바일·태블릿 헤더(브랜드 W·Wabi + 가이드 + 국가 전환)를 홈
 * 화면에서 떼어내 WabiApp 셸에 하나만 두고 모든 탭에서 같은 자리에 보이게 한다 — 데스크톱은
 * 지금처럼 헤더가 없고 사이드바가 그 역할을 대신한다(자기 CSS의 1180px+ 구간에서 숨는다).
 * 로고는 누르면 홈으로 돌아가므로 실제 button이고 aria-label을 단다(가짜 어포던스 금지 원칙과
 * 같은 이유로, 눌리는 요소는 반드시 실제로 눌린다).
 */
export function AppHeader({ countryLabel, onOpenGuide, onOpenCountryPicker, onGoHome }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={onGoHome} aria-label="홈으로 이동">
        <span className={styles.logo} aria-hidden="true">
          W
        </span>
        <span className={styles.brandName}>Wabi</span>
      </button>
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
  );
}

import type { TabId } from "@/Front/common/types/domain";
import styles from "./TabBar.module.css";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "tasks", label: "할 일" },
  { id: "notes", label: "메모" },
  { id: "me", label: "나" },
];

export interface TabBarProps {
  active: TabId;
  onSelect: (id: TabId) => void;
  incompleteTaskCount: number;
  onOpenGuide: () => void;
  countryLabel: string | null;
  onOpenCountryPicker: () => void;
}

/**
 * 캔버스 06절: 같은 <nav> 마크업 하나를 미디어 쿼리로만 세 형태로 바꾼다 — 모바일 하단 탭바,
 * 태블릿 아이콘 레일(88px, 가이드만), 데스크톱 사이드바(236px, 가이드+국가 선택까지).
 * 조건부 렌더로 형태별 마크업을 따로 만들지 않는다(하이드레이션 불일치·중복 마크업 방지) —
 * 레일 전용 로고·데스크톱 브랜드·하단 그룹·배지를 모두 항상 렌더하고 CSS로 숨긴다.
 */
export function TabBar({
  active,
  onSelect,
  incompleteTaskCount,
  onOpenGuide,
  countryLabel,
  onOpenCountryPicker,
}: TabBarProps) {
  return (
    <nav className={styles.bar}>
      {/* 태블릿 레일 전용 — W 로고만, 라벨 없음 */}
      <span className={styles.railLogo} aria-hidden="true">
        W
      </span>

      {/* 데스크톱 사이드바 전용 브랜드. 사이드바 접기는 동작이 정의돼 있지 않아(캔버스는 정적
          목업일 뿐) 가짜 클릭 어포던스를 만들지 않도록 button이 아닌 장식용 표시로만 둔다. */}
      <div className={styles.brand}>
        <span className={styles.brandLogo} aria-hidden="true">
          W
        </span>
        <span className={styles.brandName}>Wabi</span>
        <span className={styles.collapseHint} aria-hidden="true">
          <span className={styles.collapseBar} />
          <span className={styles.collapseChevron}>‹</span>
        </span>
      </div>

      <div className={styles.tabList}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[styles.tab, tab.id === active ? styles.active : ""].join(" ")}
            aria-current={tab.id === active ? "page" : undefined}
            onClick={() => onSelect(tab.id)}
          >
            <span className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>{tab.label}</span>
            {tab.id === "tasks" ? (
              <span className={styles.badge} aria-hidden="true">
                {incompleteTaskCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={styles.bottomGroup}>
        <button type="button" className={styles.guideButton} onClick={onOpenGuide} aria-label="가이드 열기">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3.2" y1="5" x2="10.8" y2="5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            <line x1="3.2" y1="8.2" x2="8.5" y2="8.2" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </svg>
          <span className={styles.guideLabel}>가이드</span>
        </button>
        {countryLabel ? (
          <button type="button" className={styles.countryButton} onClick={onOpenCountryPicker}>
            <span>{countryLabel}</span>
            <span aria-hidden="true">▾</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}

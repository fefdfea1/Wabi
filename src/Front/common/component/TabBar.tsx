import { useEffect, useState } from "react";
import type { TabId } from "@/Front/common/types/domain";
import styles from "./TabBar.module.css";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "tasks", label: "할 일" },
  { id: "notes", label: "메모" },
  { id: "me", label: "프로필" }, // discussion.md 20.4절: 탭 id는 me 그대로(저장된 상태와 어긋나지 않게), 라벨만 바꾼다.
];

const COLLAPSE_STORAGE_KEY = "wabi:sidebarCollapsed";

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
 *
 * discussion.md 19.10절: 데스크톱 사이드바 접기 버튼이 예전에는 span+aria-hidden뿐이라 보이는데
 * 눌리지 않는 가짜 어포던스였다(국가 배지와 같은 문제). 이제 실제 button이고, 누르면 236 ↔
 * 88(태블릿 레일과 같은 폭)로 접힌다. 상태는 localStorage에 남겨 재방문해도 유지한다 — 초기값은
 * 항상 펼침(false)이라 서버·최초 클라이언트 렌더가 같고, 마운트 후 저장된 값이 있으면 반영한다.
 */
export function TabBar({
  active,
  onSelect,
  incompleteTaskCount,
  onOpenGuide,
  countryLabel,
  onOpenCountryPicker,
}: TabBarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      // 프라이빗 모드 등 저장소 접근이 막힌 환경에서는 기본값(펼침)을 유지한다.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // 위와 같은 이유로 조용히 무시한다.
      }
      return next;
    });
  }

  return (
    <nav className={[styles.bar, collapsed ? styles.collapsed : ""].filter(Boolean).join(" ")}>
      {/* 태블릿 레일 전용 — W 로고만, 라벨 없음 */}
      <span className={styles.railLogo} aria-hidden="true">
        W
      </span>

      {/* 데스크톱 사이드바 전용 브랜드 + 접기 버튼 */}
      <div className={styles.brand}>
        <span className={styles.brandLogo} aria-hidden="true">
          W
        </span>
        <span className={styles.brandName}>Wabi</span>
        {/* discussion.md 20.2절: 기존 세로 막대+‹ 문자 아이콘이 거의 안 보인다는 지적으로,
            뚜렷한 이중 화살표 SVG로 바꾸고 상태에 따라 180도 회전시켜 방향을 보여준다. */}
        <button
          type="button"
          className={[styles.collapseHint, collapsed ? styles.collapseHintCollapsed : ""].filter(Boolean).join(" ")}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-expanded={!collapsed}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10.5 3 5.5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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

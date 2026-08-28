import type { TabId } from "@/Front/common/types/domain";
import styles from "./TabBar.module.css";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "tasks", label: "할 일" },
  { id: "notes", label: "메모" },
  { id: "me", label: "나" },
];

export function TabBar({
  active,
  onSelect,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <nav className={styles.bar}>
      {/*
        discussion.md 11.1절: 데스크톱(>=1024px) 사이드바 상단 브랜드. 마크업은 항상 렌더하고
        <640px 구간에서는 CSS로 숨긴다(조건부 렌더 금지 — 하이드레이션 불일치·중복 마크업 방지).
      */}
      <div className={styles.brand}>
        <span className={styles.brandLogo} aria-hidden="true">
          W
        </span>
        <span className={styles.brandName}>Wabi</span>
      </div>
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
        </button>
      ))}
    </nav>
  );
}

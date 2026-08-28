"use client";

import { useLayoutEffect, useState } from "react";
import type { ThemeMode } from "@/Front/common/types/domain";
import styles from "./ThemeToggle.module.css";

const STORAGE_KEY = "theme";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);

  // 인라인 초기화 스크립트가 설정한 data-theme 값을, 개발 모드의 Strict Mode 리마운트가
  // 지우는 것을 다시 맞춰준다. 프로덕션 빌드에서는 이미 값이 같으므로 no-op.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function applyTheme(next: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  }

  function toggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  /*
   * 캔버스 06절(태블릿·PC): 모바일은 지금의 토글 버튼 그대로 두고, 744px 이상에서는 라이트/다크
   * 두 옵션을 한꺼번에 보여주는 세그먼트로 바뀐다. 토글(단일 버튼)과 세그먼트(두 버튼)는 클릭
   * 의미 자체가 달라(전환 vs 명시적 선택) 마크업을 하나로 겸용할 수 없어, 두 구조를 모두 렌더링해
   * 두고 미디어 쿼리로 하나만 보이게 한다(TabBar의 브랜드 블록과 같은 방식 — 조건부 렌더 아님).
   */
  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.toggle} onClick={toggle}>
        {theme === "dark" ? "다크" : "라이트"} ›
      </button>
      <div className={styles.segment} role="tablist" aria-label="화면 모드 선택">
        <button
          type="button"
          role="tab"
          aria-selected={theme === "light"}
          className={[styles.segmentOption, theme === "light" ? styles.segmentSelected : ""].filter(Boolean).join(" ")}
          onClick={() => applyTheme("light")}
        >
          라이트
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={theme === "dark"}
          className={[styles.segmentOption, theme === "dark" ? styles.segmentSelected : ""].filter(Boolean).join(" ")}
          onClick={() => applyTheme("dark")}
        >
          다크
        </button>
      </div>
    </div>
  );
}

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

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  }

  return (
    <button type="button" className={styles.toggle} onClick={toggle}>
      {theme === "dark" ? "다크" : "라이트"} ›
    </button>
  );
}

"use client";

import { useLayoutEffect, useState } from "react";
import type { ThemeMode } from "@/Front/common/types/domain";
import styles from "./ThemeToggle.module.css";

const STORAGE_KEY = "theme";
// discussion.md 19.6절: 앱 기본값이 다크로 바뀌었다(app/layout.tsx의 data-theme="dark"). 이 기본값이
// bare fallback과 어긋나면, 아래 useLayoutEffect가 저장된 값이 없는 이용자의 화면을 마운트 시점에
// "light"로 강제로 되돌려버린다(19.5절 이후 QA가 실제로 재현: 나 화면처럼 ThemeToggle이 있는
// 화면으로 이동하면 다크가 라이트로 바뀌었다). 저장된 값이 없을 때의 기본값은 항상 layout.tsx와
// 같아야 한다.
const DEFAULT_THEME: ThemeMode = "dark";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? DEFAULT_THEME;
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
   * discussion.md 20.15절: 값이 라이트·다크 둘뿐이라 나란히 둔 두 옵션 중 하나를 정확히 골라
   * 누르는 세그먼트 대신, 행 어디를 눌러도 현재의 반대로 바뀌는 토글 하나로 모든 화면 폭을
   * 통일한다(20.13절 4번이 모바일에만 적용했던 것을 전체로 넓힌 것 — 예전 세그먼트 구조는
   * 제거). 버튼은 부모 행(MeScreen의 .settingRow, position:relative) 전체를 덮는 투명
   * 오버레이라 행 어디를 눌러도 전환된다. 테두리·화살표는 없고 현재 상태 글자만 오른쪽에
   * 보인다. role="switch"·aria-checked로 온/오프 두 상태임을 알린다.
   */
  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      className={styles.toggle}
      onClick={toggle}
    >
      {theme === "dark" ? "다크" : "라이트"}
    </button>
  );
}

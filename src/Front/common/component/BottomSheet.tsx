"use client";

import { useEffect, type ReactNode } from "react";
import styles from "./BottomSheet.module.css";

export interface BottomSheetProps {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * discussion.md 4절: radius 26 26 0 0, 상단 핸들 38x4, 딤 rgba(0,0,0,0.4).
 * wabiSheetUp/wabiFadeIn 키프레임은 globals.css에 정의되어 있다.
 * Esc 키로도 닫을 수 있어야 해서(키보드 접근성) 이 컴포넌트만 자체 상태 없이도 effect가 필요해 client다.
 */
export function BottomSheet({ titleId, onClose, children, footer }: BottomSheetProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.handleRow}>
          <span className={styles.handle} aria-hidden="true" />
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

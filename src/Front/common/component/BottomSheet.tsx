"use client";

import { useEffect, type ReactNode } from "react";
import styles from "./BottomSheet.module.css";

export interface BottomSheetProps {
  titleId: string;
  /** discussion.md 20.12절: 나가는 애니메이션이 도는 동안 true. 부모(각 시트 컴포넌트)가
   *  useClosingTransition으로 관리하며 실제 언마운트 시점을 결정한다. */
  closing: boolean;
  /** 실제 언마운트(onClose)가 아니라 "닫는 중" 상태로 전환만 한다. */
  onRequestClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * discussion.md 4절: radius 26 26 0 0, 상단 핸들 38x4, 딤 rgba(0,0,0,0.4).
 * wabiSheetUp/wabiFadeIn 키프레임은 이 파일과 짝지어진 module.css 안에 정의돼 있다(20.9절).
 * Esc 키로도 닫을 수 있어야 해서(키보드 접근성) 이 컴포넌트만 자체 상태 없이도 effect가 필요해 client다.
 *
 * discussion.md 20.12절: 딤 클릭·Escape 모두 onRequestClose만 부른다 — 실제 언마운트(onClose에
 * 해당하는 동작)는 부모가 나가는 애니메이션이 끝난 뒤에 처리한다. 이 컴포넌트 자신은 그 타이밍을
 * 모르고, closing prop에 따라 나가는 애니메이션 클래스만 붙인다.
 */
export function BottomSheet({ titleId, closing, onRequestClose, children, footer }: BottomSheetProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onRequestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onRequestClose]);

  // discussion.md 20.13절 1번: 시트가 떠 있는 동안 배경 페이지가 스크롤되지 않게 잠근다 —
  // 흔한 모달 관례이자, 휠·터치가 뒤 배경으로 새는 경우를 원천적으로 막는 방어책이다.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={[styles.dim, closing ? styles.dimClosing : ""].filter(Boolean).join(" ")}
        aria-label="닫기"
        onClick={onRequestClose}
      />
      <div
        className={[styles.sheet, closing ? styles.sheetClosing : ""].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.handleRow}>
          <span className={styles.handle} aria-hidden="true" />
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

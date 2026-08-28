"use client";

import { useEffect, useState } from "react";

/**
 * discussion.md 20.12절: CSS 애니메이션은 요소가 DOM에 "붙을 때"만 실행된다 — 닫는 즉시
 * 부모가 언마운트하면 나가는 애니메이션이 돌 틈이 없다. 닫기 요청을 받으면 먼저 "닫는 중"
 * 상태로 전환해 나가는 애니메이션용 CSS 클래스를 붙이고, durationMs가 지난 뒤(나가는
 * 애니메이션이 끝난 뒤)에야 실제 onClose(부모의 언마운트)를 부른다.
 *
 * 시트·모달·할 일 상세 화면 모두 이 훅 하나를 같은 방식으로 쓴다. 시트 자신의 버튼("취소" 등)과
 * BottomSheet의 딤 클릭·Escape 모두 원래 onClose 대신 이 훅이 돌려주는 requestClose를 불러야
 * 한다 — onClose를 직접 부르면 애니메이션 없이 즉시 언마운트된다.
 */
export function useClosingTransition(onClose: () => void, durationMs: number) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [closing, onClose, durationMs]);

  function requestClose() {
    setClosing(true);
  }

  return { closing, requestClose };
}

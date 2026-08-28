import { Button } from "wabi";

/** 화면 하단 고정 액션. 높이 52, radius 14, ink 배경. */
export function Primary() {
  return <Button>지금 하기</Button>;
}

/** 주 동작 옆에 두는 보조 동작. 1.5px ink 테두리. */
export function Secondary() {
  return <Button variant="secondary">나중에 하기</Button>;
}

/** 이미 끝난 동작. 누를 수 없다는 것이 색으로 드러난다. */
export function Disabled() {
  return <Button disabled>완료됨</Button>;
}

/** 할 일 상세 화면 하단에 두 버튼이 함께 놓이는 실제 배치. */
export function ActionPair() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
      <Button>완료로 표시하기</Button>
      <Button variant="secondary">완료 취소하기</Button>
    </div>
  );
}

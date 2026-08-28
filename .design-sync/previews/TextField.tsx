import { TextField } from "wabi";

/** 할 일 추가 시트의 제목 입력. 높이 54, radius 14, sunken 배경. */
export function Placeholder() {
  return (
    <div style={{ width: 330 }}>
      <TextField placeholder="예: 국제운전면허증 발급" />
    </div>
  );
}

/** 값이 들어간 상태. */
export function Filled() {
  return (
    <div style={{ width: 330 }}>
      <TextField defaultValue="국제운전면허증 발급" />
    </div>
  );
}

/** 출국일 입력. type을 그대로 넘길 수 있어 OS 기본 날짜 선택기가 뜬다. */
export function DateInput() {
  return (
    <div style={{ width: 330 }}>
      <TextField type="date" defaultValue="2026-09-09" aria-label="출국일" />
    </div>
  );
}

/** 라벨과 함께 놓이는 실제 배치. */
export function WithLabel() {
  return (
    <div style={{ width: 330, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--strong)" }}>언제 할 일인가요?</span>
      <TextField placeholder="예: 계좌 개설 예약" />
    </div>
  );
}

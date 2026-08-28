import { ProgressBar } from "wabi";

/** 홈 화면의 준비 진행률. 트랙은 sunken, 채워진 부분은 ink. */
export function Partial() {
  return (
    <div style={{ width: 320 }}>
      <ProgressBar value={8} max={14} />
    </div>
  );
}

/** 아직 시작하지 않은 상태. */
export function Empty() {
  return (
    <div style={{ width: 320 }}>
      <ProgressBar value={0} max={14} />
    </div>
  );
}

/** 전부 끝낸 상태. */
export function Complete() {
  return (
    <div style={{ width: 320 }}>
      <ProgressBar value={14} max={14} />
    </div>
  );
}

/** 할 일이 하나도 없을 때. 분모가 0이어도 NaN%가 되지 않고 0%로 처리된다. */
export function ZeroDenominator() {
  return (
    <div style={{ width: 320 }}>
      <ProgressBar value={0} max={0} />
    </div>
  );
}

/** 라벨과 함께 놓이는 실제 배치. 숫자는 mono 서체에 tabular-nums. */
export function WithLabel() {
  return (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
        <span>출국 전 준비</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", color: "var(--strong)" }}>8 / 14</span>
      </div>
      <ProgressBar value={8} max={14} />
    </div>
  );
}

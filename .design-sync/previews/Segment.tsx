import { Segment } from "wabi";

const noop = () => {};

const PHASES = [
  { value: "pre", label: "출국 전" },
  { value: "post", label: "현지 정착" },
];

/** 할 일 화면에서 단계를 나누는 세그먼트. 선택된 쪽만 surface 배경으로 떠오른다. */
export function PreSelected() {
  return (
    <div style={{ width: 320 }}>
      <Segment options={PHASES} value="pre" onChange={noop} aria-label="준비 단계" />
    </div>
  );
}

/** 오른쪽을 고른 상태. */
export function PostSelected() {
  return (
    <div style={{ width: 320 }}>
      <Segment options={PHASES} value="post" onChange={noop} aria-label="준비 단계" />
    </div>
  );
}

/** 가이드 시트에서 쓰는 상황 구분. 라벨이 달라도 같은 규격을 유지한다. */
export function GuideSituation() {
  return (
    <div style={{ width: 320 }}>
      <Segment
        options={[
          { value: "pre", label: "출국 전" },
          { value: "post", label: "현지 도착" },
        ]}
        value="post"
        onChange={noop}
        aria-label="현재 상황"
      />
    </div>
  );
}

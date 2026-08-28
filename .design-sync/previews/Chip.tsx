import { Chip } from "wabi";

const noop = () => {};

/** 국가 선택처럼 고를 수 있는 칩. 선택된 것만 ink 배경으로 채워진다. */
export function Selectable() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Chip label="호주" selected onClick={noop} />
      <Chip label="캐나다" onClick={noop} />
      <Chip label="일본" onClick={noop} />
    </div>
  );
}

/** onClick이 없으면 순수 표시용 태그다. 버튼이 아니라 span으로 렌더되어 가짜 클릭 어포던스를 만들지 않는다. */
export function ReadOnlyTag() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Chip label="출국 전 · 서류" />
      <Chip label="현지 정착 · 금융" />
    </div>
  );
}

/** 마감 선택지처럼 여러 개가 줄바꿈되는 배치. */
export function Wrapped() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: 300 }}>
      <Chip label="오늘까지" selected onClick={noop} />
      <Chip label="이번 주" onClick={noop} />
      <Chip label="이번 달" onClick={noop} />
      <Chip label="도착 후" onClick={noop} />
    </div>
  );
}

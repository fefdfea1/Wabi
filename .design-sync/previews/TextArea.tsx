import { TextArea } from "wabi";

/** 메모 작성 시트의 본문 입력. TextField 규격을 잇되 높이만 늘렸다. */
export function Placeholder() {
  return (
    <div style={{ width: 330 }}>
      <TextArea rows={5} placeholder="기억해 둘 것을 적어 두세요." />
    </div>
  );
}

/** 여러 줄이 들어간 상태. 세로 리사이즈 손잡이가 없다. */
export function Filled() {
  return (
    <div style={{ width: 330 }}>
      <TextArea
        rows={5}
        defaultValue={"은행 예약 9월 12일 오전 10시\n지점: 시티 브랜치\n여권과 주소 증명 챙기기"}
      />
    </div>
  );
}

/** 메모 작성 시트의 실제 배치. 안내 문구가 입력창 아래에 붙는다. */
export function InSheet() {
  return (
    <div style={{ width: 330, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--strong)" }}>메모</span>
      <TextArea rows={5} placeholder="기억해 둘 것을 적어 두세요." />
      <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
        계좌번호나 여권번호처럼 민감한 정보는 적지 않기를 권합니다.
      </span>
    </div>
  );
}

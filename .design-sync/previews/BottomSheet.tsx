import { BottomSheet, Button, ListRow } from "wabi";

const noop = () => {};

/** 가이드 시트. 상단 핸들과 딤 배경이 함께 보이는 기본 형태. */
export function Guide() {
  return (
    <div style={{ position: "relative", width: 360, height: 420, overflow: "hidden", background: "var(--bg)" }}>
      <BottomSheet titleId="guide-title" onClose={noop}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 id="guide-title" style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--strong)" }}>
            현재 어떤 상황인가요?
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>상황에 맞는 질문만 모아 보여드립니다.</p>
        </div>
      </BottomSheet>
    </div>
  );
}

/** 하단 고정 액션이 붙은 형태. footer는 본문이 길어져도 항상 아래에 남는다. */
export function WithFooter() {
  return (
    <div style={{ position: "relative", width: 360, height: 420, overflow: "hidden", background: "var(--bg)" }}>
      <BottomSheet
        titleId="pain-title"
        onClose={noop}
        footer={<Button variant="secondary">닫기</Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 id="pain-title" style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--strong)" }}>
            먼저 간 사람들이 힘들어한 것
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>미리 알면 대처가 쉬워지는 순서로 정리했습니다.</p>
        </div>
      </BottomSheet>
    </div>
  );
}

/** 목록을 담은 형태. 시트 안에서도 행 높이 64px이 그대로 유지된다. */
export function WithList() {
  return (
    <div style={{ position: "relative", width: 360, height: 420, overflow: "hidden", background: "var(--bg)" }}>
      <BottomSheet titleId="tasks-title" onClose={noop}>
        <h2 id="tasks-title" style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--strong)" }}>
          이번 주 할 일
        </h2>
        <ListRow title="건강보험 가입" meta="비자 조건 8501" done={false} urgent onToggle={noop} onOpen={noop} />
        <ListRow title="은행 계좌 개설" meta="개설 후 20일 이내" done={false} urgent={false} onToggle={noop} onOpen={noop} />
      </BottomSheet>
    </div>
  );
}

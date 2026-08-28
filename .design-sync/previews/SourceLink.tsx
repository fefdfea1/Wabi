import { SourceLink } from "wabi";

/** 할 일 상세 아래 붙는 출처. 도메인을 함께 보여줘 어디서 온 정보인지 화면에서 바로 드러난다. */
export function Default() {
  return <SourceLink url="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417" />;
}

/** 다른 출처. 정부 기관이 아닌 곳도 도메인으로 구분된다. */
export function BankSource() {
  return <SourceLink url="https://www.commbank.com.au/moving-to-australia.html" />;
}

/** url이 없으면 아무것도 렌더하지 않는다. 빈 링크나 '출처 없음' 문구를 남기지 않는다. */
export function NoUrl() {
  return (
    <div style={{ fontSize: 13, color: "var(--muted)" }}>
      <SourceLink />
      (url이 없어 위에 아무것도 렌더되지 않음)
    </div>
  );
}

/** 본문 끝에 놓이는 실제 배치. */
export function InContext() {
  return (
    <div style={{ width: 330, display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: "var(--text)" }}>
        비자 조건 8501에 따라 체류 기간 전체를 덮는 적정한 건강보험을 유지해야 합니다.
      </p>
      <SourceLink url="https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/adequate-health-insurance" />
    </div>
  );
}

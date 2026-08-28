import { NextActionCard } from "wabi";

const noop = () => {};

/** 홈 화면의 다음 행동 카드. 미완료 할 일 중 첫 번째를 보여주고 설명은 본문 첫 문장만 쓴다. */
export function Default() {
  return (
    <div style={{ width: 350 }}>
      <NextActionCard
        title="워킹홀리데이 비자 신청"
        description="만 18세부터 30세까지 신청할 수 있고 잔고 증명으로 AUD 5,000을 요구합니다."
        ctaLabel="지금 하기"
        onAction={noop}
      />
    </div>
  );
}

/** 제목이 짧은 경우. 카드 높이는 내용에 따라 줄어든다. */
export function ShortTitle() {
  return (
    <div style={{ width: 350 }}>
      <NextActionCard
        title="전입신고"
        description="전입일부터 14일 이내에 마쳐야 합니다."
        ctaLabel="지금 하기"
        onAction={noop}
      />
    </div>
  );
}

/** 설명이 긴 경우. 두 줄 이상으로 늘어나도 CTA 위치와 여백이 유지된다. */
export function LongDescription() {
  return (
    <div style={{ width: 350 }}>
      <NextActionCard
        title="주 공보험 등록"
        description="온타리오의 OHIP은 한 고용주 밑에서 정규직으로 6개월 이상 근무해야 신청할 수 있습니다."
        ctaLabel="자세히 보기"
        onAction={noop}
      />
    </div>
  );
}

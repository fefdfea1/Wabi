import { ListRow } from "wabi";

const noop = () => {};

/** 아직 하지 않은 할 일. 체크 원은 비어 있고 오른쪽에 화살표가 있다. */
export function Todo() {
  return (
    <div style={{ width: 350 }}>
      <ListRow
        title="워킹홀리데이 비자 신청"
        meta="만 18~30세"
        done={false}
        urgent={false}
        onToggle={noop}
        onOpen={noop}
      />
    </div>
  );
}

/** 마감이 임박한 할 일. 체크 테두리와 메타 글자만 alert 색으로 올라간다. */
export function Urgent() {
  return (
    <div style={{ width: 350 }}>
      <ListRow
        title="건강보험 가입"
        meta="비자 조건 8501"
        done={false}
        urgent
        onToggle={noop}
        onOpen={noop}
      />
    </div>
  );
}

/** 끝낸 할 일. 제목이 흐려지고 취소선이 생기며 화살표가 사라진다. */
export function Done() {
  return (
    <div style={{ width: 350 }}>
      <ListRow
        title="유심 개통"
        meta="완료"
        done
        urgent={false}
        onToggle={noop}
        onOpen={noop}
      />
    </div>
  );
}

/** 실제 목록에서는 세 상태가 한 화면에 섞여 나온다. 행 높이 64px이 반복된다. */
export function List() {
  return (
    <div style={{ width: 350 }}>
      <ListRow title="워킹홀리데이 비자 신청" meta="만 18~30세" done={false} urgent={false} onToggle={noop} onOpen={noop} />
      <ListRow title="건강보험 가입" meta="비자 조건 8501" done={false} urgent onToggle={noop} onOpen={noop} />
      <ListRow title="은행 계좌 개설" meta="개설 후 20일 이내 신원 확인" done={false} urgent={false} onToggle={noop} onOpen={noop} />
      <ListRow title="유심 개통" meta="완료" done urgent={false} onToggle={noop} onOpen={noop} />
    </div>
  );
}

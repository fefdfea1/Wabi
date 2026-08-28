export type CountryCode = "AU" | "CA" | "JP";

export interface Country {
  code: CountryCode;
  label: string;
  /**
   * 워킹홀리데이 비자로 체류할 수 있는 기간(일). discussion.md 10.2절: 출국일(사용자 입력) +
   * 이 값으로 비자 만료일을 계산한다. 조사로 확인되지 않은 국가는 비워 두고, 화면은 이 값이
   * 없으면 비자 만료일 줄 자체를 표시하지 않는다. 출국일·비자 만료일 자체는 개인 값이라
   * Country에 두지 않는다(더 이상 depart/visa 필드를 두지 않는 이유).
   */
  stayDurationDays?: number;
  /** stayDurationDays의 근거 출처 URL (Research-team 조사 결과 주입용) */
  sourceUrl?: string;
}

export type TaskPhase = "pre" | "post";

export interface Task {
  id: string;
  phase: TaskPhase;
  title: string;
  meta: string;
  week: boolean;
  urgent: boolean;
  tag: string;
  body: string;
  items: string[];
  done: boolean;
  /** meta/body에 담긴 실무 정보의 근거 출처 URL (Research-team 조사 결과 주입용) */
  sourceUrl?: string;
}

export type GuideSituation = "pre" | "post";

export interface GuideItem {
  id: string;
  title: string;
  body: string;
  points: string[];
  /** 답변 내용의 근거 출처 URL (Research-team 조사 결과 주입용) */
  sourceUrl?: string;
}

export interface PainItem {
  id: string;
  num: number;
  when: string;
  title: string;
  body: string;
  points: string[];
  /** 본문·대처법의 근거 출처 URL (Research-team 조사 결과 주입용) */
  sourceUrl?: string;
}

export type TabId = "home" | "tasks" | "notes" | "me";

export type ThemeMode = "light" | "dark";

/** 할 일 추가 시트의 마감 선택지 */
export type DueOption = "오늘까지" | "이번 주" | "이번 달" | "도착 후";

/**
 * 메모 탭에서 localStorage에 저장하는 메모 한 편. 캔버스 06절(태블릿·PC) 데스크톱 메모 목업이
 * 제목 입력과 내용 입력을 나눠 두고 목록도 제목·내용 요약·날짜로 그려 title 필드를 둔다.
 * title은 선택 입력이다 — 비어 있으면 목록에서 본문 첫 줄을 제목처럼 보여준다(예전 레코드
 * 호환: title이 아예 없던 이전 저장 데이터도 읽을 때 빈 문자열로 채워 넣는다, notes.ts 참고).
 */
export interface NoteRecord {
  id: string;
  title: string;
  body: string;
  /** 마지막으로 저장한 시각의 전체 ISO 타임스탬프(예: "2026-08-28T13:45:00.000Z").
   *  같은 날 여러 메모를 고치는 경우에도 "최근 수정 순" 정렬이 정확하도록 날짜뿐 아니라
   *  시각까지 담는다. 화면에는 이 값에서 뽑은 "8월 28일" 같은 날짜만 보여준다. */
  updatedAt: string;
}

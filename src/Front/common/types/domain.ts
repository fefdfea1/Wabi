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
  /**
   * discussion.md 19.3절: 할 일 추가 시트에서 달력으로 직접 고른 마감(ISO yyyy-mm-dd). 이 값이
   * 있는 할 일은 `meta`/`urgent`/`week`를 저장된 값 그대로 쓰지 않고, 오늘 날짜 기준으로
   * 매번 다시 계산한다(wabiLogic.ts의 deriveDueDisplay, useWabiApp.ts에서 client effect로 적용) —
   * 그렇지 않으면 "3일 남음"처럼 날짜가 지날수록 틀려지는 문구가 그대로 굳어버린다(P-06과 같은 함정).
   * 고정 선택지(오늘까지/이번 주/이번 달/도착 후)로 만든 할 일에는 이 필드가 없다.
   */
  dueDate?: string;
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
 * 메모 탭에서 localStorage에 저장하는 메모 한 편. discussion.md 19.7절(사용자 지시): 우측 336
 * 패널을 홈·메모가 공유하는 하나의 컴포넌트로 합치면서 제목 입력칸을 없앴다 — title을 채울
 * 방법이 없어져 레코드에서도 뺐다. 목록의 "제목" 자리는 본문 첫 줄을 잘라 쓴다(NotesPanel/
 * NotesScreen 참고). title이 들어간 예전 레코드가 있어도 읽을 때 그냥 무시한다(notes.ts 참고).
 */
export interface NoteRecord {
  id: string;
  body: string;
  /** 마지막으로 저장한 시각의 전체 ISO 타임스탬프(예: "2026-08-28T13:45:00.000Z").
   *  같은 날 여러 메모를 고치는 경우에도 "최근 수정 순" 정렬이 정확하도록 날짜뿐 아니라
   *  시각까지 담는다. 화면에는 이 값에서 뽑은 "8월 28일" 같은 날짜만 보여준다. */
  updatedAt: string;
}

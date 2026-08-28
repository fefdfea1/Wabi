import type { Task } from "@/Front/common/types/domain";
// 상대 경로 + .ts 확장자를 쓴다(다른 파일들의 @/Front/* 별칭과 다름) — 이 파일은
// wabiLogic.test.ts가 Node로 직접 실행하는데, Node는 tsconfig의 경로 별칭을 모른다.
import { formatDateOnly, parseLocalDateOnly } from "../../common/date/localDate.ts";

/**
 * discussion.md 7절: "NEXT 카드는 미완료 항목 중 첫 번째를 보여주고" — 미완료가 하나도 없으면
 * 첫 항목으로 폴백한다(캔버스 `ALL.find(x => !done[x.id]) || ALL[0]`). 목록이 비어 있으면 null.
 */
export function pickNextTask(tasks: Task[], done: Record<string, boolean>): Task | null {
  if (tasks.length === 0) return null;
  return tasks.find((task) => !done[task.id]) ?? tasks[0];
}

/** discussion.md 7절: NEXT 카드 설명은 본문의 첫 문장만(마침표 기준). */
export function firstSentence(body: string): string {
  const [first] = body.split(".");
  const sentence = first.trim();
  return sentence ? `${sentence}.` : "";
}

/**
 * discussion.md 10.2절: D-day = 출국일(ISO yyyy-mm-dd) − 오늘.
 * `today`는 반드시 호출부가 client effect 안에서 만든 `new Date()`를 넘겨야 한다 — 이 함수
 * 안에서 직접 `new Date()`를 만들면 정적 프리렌더 시점(서버·빌드 타임)의 날짜가 그대로 굳어
 * 하이드레이션 불일치와 "영원히 어제 날짜"인 D-day가 생긴다.
 */
export function computeDDay(departureDateIso: string, today: Date): number | null {
  const target = parseLocalDateOnly(departureDateIso);
  if (Number.isNaN(target.getTime())) return null;

  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - t.getTime()) / 86_400_000);
}

/** discussion.md 10.2절: 출국 당일은 D-DAY, 지난 뒤에는 D+n. */
export function formatDDay(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}

/**
 * discussion.md 19.3절: 할 일 마감을 달력으로 직접 고른 경우, 목록에 보여줄 상대 표현("오늘까지",
 * "3일 남음" 등)과 urgent/week 플래그를 오늘 날짜 기준으로 계산한다. computeDDay와 같은 함정이
 * 있다 — `today`는 반드시 호출부가 client effect 안에서 만든 `new Date()`를 넘겨야 한다. 이 함수
 * 안에서 직접 `new Date()`를 만들면 정적 프리렌더 시점의 날짜가 굳어버린다.
 */
export function deriveDueDisplay(
  dueDateIso: string,
  today: Date,
): { meta: string; urgent: boolean; week: boolean } | null {
  const due = parseLocalDateOnly(dueDateIso);
  if (Number.isNaN(due.getTime())) return null;

  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - t.getTime()) / 86_400_000);

  const meta =
    diffDays < 0 ? "마감 지남" : diffDays === 0 ? "오늘까지" : diffDays === 1 ? "내일까지" : `${diffDays}일 남음`;

  return { meta, urgent: diffDays <= 0, week: diffDays <= 7 };
}

/**
 * discussion.md 21.3절: 할 일 목록 화면 전용 정렬. 직접 추가한 할 일이 기본 제공 할 일보다
 * 위에 오고, 직접 추가한 것끼리는 createdAt 내림차순(가장 최근에 만든 것이 맨 위)이다. 기본
 * 제공 할 일의 순서는 조사해서 넣은 준비 순서이므로 그대로 둔다(builtinTasks를 재정렬하지 않고
 * 뒤에 그대로 이어붙인다).
 *
 * builtin/custom을 필드 값으로 추측하지 않고 호출부가 이미 알고 있는 두 배열로 나눠 받는다 —
 * createdAt이 없는 직접 추가 항목(손상된 레코드)도 있을 수 있어(21.2절) 필드만으로는 구분이
 * 모호하다. 그런 항목은 ''(가장 작은 문자열)로 취급돼 정렬에서 가장 오래된 것으로 밀리되,
 * custom 목록에는 그대로 남아 builtin보다는 위에 온다.
 *
 * pickNextTask(다음 할 일 카드)·완료 개수 계산에는 이 함수의 결과를 넘기면 안 된다 — 그쪽은
 * 마감일·긴급도로 고르는 별개 규칙이라 원래 순서를 그대로 써야 한다.
 */
export function sortTasksForDisplay(builtinTasks: Task[], customTasks: Task[]): Task[] {
  const sortedCustom = [...customTasks].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return sortedCustom.concat(builtinTasks);
}

/**
 * 비자 만료일 = 출국일 + 국가별 체류 허용 기간(일). 두 값 모두 고정된 입력이라
 * "오늘"을 참조하지 않으므로 서버/클라이언트 어디서 실행해도 같은 결과라 하이드레이션 문제가 없다.
 */
export function computeVisaExpiry(departureDateIso: string, stayDurationDays: number): string | null {
  const departure = parseLocalDateOnly(departureDateIso);
  if (Number.isNaN(departure.getTime())) return null;

  const expiry = new Date(departure);
  expiry.setDate(expiry.getDate() + stayDurationDays);
  return formatDateOnly(expiry);
}

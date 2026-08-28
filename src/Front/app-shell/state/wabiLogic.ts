import type { Task } from "@/Front/common/types/domain";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * "YYYY-MM-DD" 날짜 전용 문자열을 로컬 자정으로 파싱한다.
 *
 * `new Date("YYYY-MM-DD")`는 ECMA-262 Date Time String Format 규칙상 이 문자열을 **UTC 자정**으로
 * 해석한다. 그 결과를 이후 `setHours(0,0,0,0)`이나 `getFullYear`/`getMonth`/`getDate` 같은 **로컬
 * 시간대** 접근자와 섞어 쓰면, UTC보다 느린 시간대(예: America/Toronto, UTC-4)에서는 그 UTC 자정이
 * 전날 저녁에 해당해 날짜가 하루 앞으로 밀린다(QA 재현: 2026-08-28 기준 출국일 2026-09-09가
 * America/Toronto에서 D-11·9월 8일로 나옴 — 정답은 D-12·9월 9일).
 *
 * `new Date(year, monthIndex, day)`처럼 숫자를 따로따로 넘기는 생성자는 항상 로컬 자정을 만들기
 * 때문에 이 문제가 없다. 파싱할 수 없는 값이면 Invalid Date를 반환하고, 호출부가
 * `Number.isNaN(date.getTime())`로 확인한다.
 */
function parseLocalDateOnly(iso: string): Date {
  const match = DATE_ONLY_PATTERN.exec(iso);
  if (!match) return new Date(NaN);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** 로컬 연/월/일을 "YYYY-MM-DD"로 되돌린다. `toISOString()`은 UTC 기준이라 여기 쓰면 같은 하루-밀림 문제가 재발한다. */
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

/** 화면 표시용 한국어 날짜 포맷("2027년 9월 8일"). 고정 입력을 그대로 포맷할 뿐 "오늘"을 참조하지 않는다. */
export function formatKoreanDate(iso: string): string | null {
  const date = parseLocalDateOnly(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

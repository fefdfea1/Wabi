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

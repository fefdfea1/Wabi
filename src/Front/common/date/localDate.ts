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
export function parseLocalDateOnly(iso: string): Date {
  const match = DATE_ONLY_PATTERN.exec(iso);
  if (!match) return new Date(NaN);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** 로컬 연/월/일을 "YYYY-MM-DD"로 되돌린다. `toISOString()`은 UTC 기준이라 여기 쓰면 같은 하루-밀림 문제가 재발한다. */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 화면 표시용 한국어 날짜 포맷("2027년 9월 8일"). 고정 입력을 그대로 포맷할 뿐 "오늘"을 참조하지 않는다. */
export function formatKoreanDate(iso: string): string | null {
  const date = parseLocalDateOnly(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 오늘 날짜를 로컬 기준 "YYYY-MM-DD"로 반환한다. 반드시 사용자 이벤트 핸들러(파일 추가 등) 안에서만
 * 호출한다 — 렌더 중에 호출하면 정적 프리렌더 시점(빌드 타임) 날짜로 고정되어 하이드레이션
 * 불일치와 "영원히 그 날짜"인 값이 생긴다(computeDDay와 같은 이유, wabiLogic.ts 참고).
 */
export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

/**
 * 메모의 "수정 8월 28일" 메타 표기용. 입력은 `parseLocalDateOnly`가 다루는 날짜 전용
 * 문자열이 아니라 **전체 ISO 타임스탬프**(예: "2026-08-28T13:45:00.000Z")다 — 시각까지 포함된
 * 값은 `new Date()`가 명확하게 파싱하므로(날짜 전용 문자열의 UTC-자정 함정과 다르다),
 * 로컬 접근자로 바로 월/일을 뽑아도 안전하다. 이미 확정된 과거 시각을 포맷할 뿐 "오늘"을
 * 참조하지 않으므로 렌더 중에 호출해도 하이드레이션 문제가 없다.
 */
export function formatMonthDay(isoTimestamp: string): string | null {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

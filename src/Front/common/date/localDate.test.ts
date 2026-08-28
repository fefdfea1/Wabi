/**
 * localDate.ts의 순수 함수에 대한 회귀 테스트. 이 저장소엔 테스트 러너가 없어서(package.json 참고)
 * Node로 바로 실행하는 스크립트로 작성했다.
 *
 * 실행: node src/Front/common/date/localDate.test.ts
 * (package.json의 `npm run test:local-date`도 같은 명령을 돌린다.)
 *
 * 이 파일이 지키는 버그(날짜 전용 문자열을 UTC로 파싱해 놓고 로컬 접근자와 섞어 써서 UTC보다
 * 느린 시간대에서 날짜가 하루 앞으로 밀리던 문제)는 Asia/Seoul에서는 재현되지 않아 구현 시점에
 * 놓쳤다(wabiLogic.ts 참고). 그래서 자기 자신을 Asia/Seoul·UTC·America/Toronto 세 시간대로
 * 재실행해, 같은 입력에 항상 같은 결과가 나오는지 확인한다.
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { formatDateOnly, formatKoreanDate, parseLocalDateOnly, todayDateOnly } from "./localDate.ts";

const REQUIRED_TIMEZONES = ["Asia/Seoul", "UTC", "America/Toronto"];
const CHILD_ENV_FLAG = "WABI_TEST_TZ_CHILD";

if (!process.env[CHILD_ENV_FLAG]) {
  orchestrate();
} else {
  const failures = runAssertions();
  if (failures > 0) process.exit(1);
}

function orchestrate(): void {
  const scriptPath = fileURLToPath(import.meta.url);
  let anyFailed = false;

  for (const tz of REQUIRED_TIMEZONES) {
    console.log(`\n=== TZ=${tz} ===`);
    try {
      execFileSync(process.execPath, [scriptPath], {
        stdio: "inherit",
        env: { ...process.env, TZ: tz, [CHILD_ENV_FLAG]: "1" },
      });
    } catch {
      anyFailed = true;
    }
  }

  if (anyFailed) {
    console.error("\nFAIL: 시간대에 따라 결과가 달라지는 함수가 있습니다. 위 출력을 확인하세요.");
    process.exit(1);
  }
  console.log("\nPASS: 세 시간대 모두에서 localDate 함수 결과가 일치합니다.");
}

function runAssertions(): number {
  const tz = process.env.TZ ?? "(system default)";
  let failures = 0;

  function check(label: string, actual: unknown, expected: unknown): void {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
      console.log(`ok   [TZ=${tz}] ${label}`);
    } else {
      failures++;
      console.error(`FAIL [TZ=${tz}] ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  // --- parseLocalDateOnly (년/월/일 왕복으로 확인) ---
  const parsed = parseLocalDateOnly("2026-09-09");
  check("parseLocalDateOnly: 연", parsed.getFullYear(), 2026);
  check("parseLocalDateOnly: 월(0-indexed)", parsed.getMonth(), 8);
  check("parseLocalDateOnly: 일", parsed.getDate(), 9);
  check("parseLocalDateOnly: 시각은 로컬 자정", parsed.getHours(), 0);
  check("parseLocalDateOnly: 파싱 불가 문자열이면 Invalid Date", Number.isNaN(parseLocalDateOnly("bad").getTime()), true);

  // --- formatDateOnly ---
  check("formatDateOnly: 로컬 자정을 YYYY-MM-DD로", formatDateOnly(new Date(2026, 0, 5)), "2026-01-05");
  check("formatDateOnly: round-trip", formatDateOnly(parseLocalDateOnly("2026-09-09")), "2026-09-09");

  // --- formatKoreanDate ---
  check("formatKoreanDate: 2026-09-09", formatKoreanDate("2026-09-09"), "2026년 9월 9일");
  check("formatKoreanDate: 한 자리 월/일도 0 없이", formatKoreanDate("2026-01-05"), "2026년 1월 5일");
  check("formatKoreanDate: 연말 경계", formatKoreanDate("2026-12-31"), "2026년 12월 31일");
  check("formatKoreanDate: 파싱 불가 문자열이면 null", formatKoreanDate(""), null);

  // --- todayDateOnly ---
  // new Date()가 만드는 "지금"과 같은 로컬 날짜여야 한다 — 이 비교 자체도 두 값 모두 로컬
  // 접근자로만 만들어 시간대에 무관하게 일치해야 정상이다.
  const now = new Date();
  const expectedToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  check("todayDateOnly: new Date()의 로컬 날짜와 일치", todayDateOnly(), expectedToday);

  return failures;
}

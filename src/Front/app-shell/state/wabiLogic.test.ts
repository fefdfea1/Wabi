/**
 * wabiLogic.ts의 순수 함수에 대한 회귀 테스트. 이 저장소엔 테스트 러너가 없어서(package.json 참고)
 * Node로 바로 실행하는 스크립트로 작성했다. Node 22+는 이런 평범한 TypeScript 문법을 별도 빌드
 * 없이 그대로 실행할 수 있다.
 *
 * 실행: node src/Front/app-shell/state/wabiLogic.test.ts
 * (package.json의 `npm run test:wabi-logic`도 같은 명령을 돌린다.)
 *
 * D-day/비자 만료일 버그(computeDDay·computeVisaExpiry·formatKoreanDate가 UTC 파싱과 로컬 접근자를
 * 섞어 써서 UTC보다 느린 시간대에서 날짜가 하루 앞으로 밀리던 문제)는 Asia/Seoul에서는 재현되지
 * 않아 구현 시점에 놓쳤다. 그래서 이 스크립트는 한 번 실행될 때 자기 자신을 Asia/Seoul·UTC·
 * America/Toronto 세 시간대로 각각 재실행해, 같은 입력에 항상 같은 결과가 나오는지 확인한다.
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { computeDDay, computeVisaExpiry, firstSentence, formatDDay, pickNextTask } from "./wabiLogic.ts";
import type { Task } from "../../common/types/domain.ts";

const REQUIRED_TIMEZONES = ["Asia/Seoul", "UTC", "America/Toronto"];
const CHILD_ENV_FLAG = "WABI_TEST_TZ_CHILD";

if (!process.env[CHILD_ENV_FLAG]) {
  orchestrate();
} else {
  const failures = runAssertions();
  if (failures > 0) process.exit(1);
}

/** 시간대별로 이 파일을 자식 프로세스로 재실행하고, 하나라도 실패하면 0이 아닌 코드로 끝난다. */
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
  console.log("\nPASS: 세 시간대 모두에서 wabiLogic 날짜 함수 결과가 일치합니다.");
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

  // --- computeDDay ---
  // QA 재현 시나리오: 오늘 2026-08-28, 출국일 2026-09-09 → D-12. America/Toronto 등에서
  // UTC 파싱 버그가 있으면 D-11로 하루 당겨져 나왔다.
  const today = new Date(2026, 7, 28); // 2026-08-28 로컬 자정
  check("computeDDay: 2026-09-09 - 오늘(2026-08-28) = D-12", computeDDay("2026-09-09", today), 12);
  check("computeDDay: 출국 당일이면 0", computeDDay("2026-08-28", today), 0);
  check("computeDDay: 지난 날짜면 음수", computeDDay("2026-08-20", today), -8);
  check("computeDDay: 파싱 불가 문자열이면 null", computeDDay("not-a-date", today), null);
  check("computeDDay: 빈 문자열이면 null", computeDDay("", today), null);

  // --- formatDDay ---
  check("formatDDay: 0일이면 D-DAY", formatDDay(0), "D-DAY");
  check("formatDDay: 양수면 D-n", formatDDay(12), "D-12");
  check("formatDDay: 음수면 D+n", formatDDay(-8), "D+8");

  // --- computeVisaExpiry ---
  // 출국 2026-09-09 + 365일(호주·일본 체류 허용 기간) = 2027-09-09 (구간에 윤년 없음).
  check("computeVisaExpiry: +365일", computeVisaExpiry("2026-09-09", 365), "2027-09-09");
  // 출국 2026-09-09 + 730일(캐나다 2년) = 2028-09-08 (구간에 2028년 윤년 2/29이 껴 하루 당겨짐).
  check("computeVisaExpiry: +730일(윤년 포함)", computeVisaExpiry("2026-09-09", 730), "2028-09-08");
  check("computeVisaExpiry: +0일이면 출국일 그대로", computeVisaExpiry("2026-09-09", 0), "2026-09-09");
  check("computeVisaExpiry: 파싱 불가 문자열이면 null", computeVisaExpiry("bad", 365), null);

  // formatKoreanDate 테스트는 src/Front/common/date/localDate.test.ts로 옮겼다
  // (구현이 그쪽으로 이동했다 — npm run test:local-date).

  // --- pickNextTask (시간대 무관, 회귀 확인용으로 함께 포함) ---
  const tasks: Task[] = [
    { id: "a", phase: "pre", title: "A", meta: "", week: false, urgent: false, tag: "", body: "", items: [], done: false },
    { id: "b", phase: "pre", title: "B", meta: "", week: false, urgent: false, tag: "", body: "", items: [], done: false },
  ];
  check("pickNextTask: 첫 미완료 항목", pickNextTask(tasks, { a: true })?.id, "b");
  check("pickNextTask: 모두 완료면 첫 항목 폴백", pickNextTask(tasks, { a: true, b: true })?.id, "a");
  check("pickNextTask: 빈 목록이면 null", pickNextTask([], {}), null);

  // --- firstSentence (시간대 무관) ---
  check("firstSentence: 마침표 기준 첫 문장", firstSentence("첫 문장입니다. 둘째 문장."), "첫 문장입니다.");
  check("firstSentence: 마침표 없으면 그대로", firstSentence("문장"), "문장.");

  return failures;
}

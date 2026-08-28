import type { CountryCode, Task, TaskPhase } from "@/Front/common/types/domain";

const STORAGE_KEY = "wabi:custom-tasks";

/**
 * discussion.md 21.1절: 직접 추가한 할 일(customTasks)을 저장한다. notes.ts와 같은 자리
 * (localStorage) — SecurityReview.md 2절 기준 안에 있다(이용자가 직접 적는 짧은 자유 텍스트이고,
 * 구조화된 신원 식별자가 아니며, 서버로 전송되지 않는다). 국가별로 나눠 저장한다
 * (Record<CountryCode, Task[]>) — 국가를 바꾸면 다른 국가의 직접 추가 항목이 섞여 보이면 안 된다.
 */
function normalizeTask(raw: unknown): Task | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id) return null;
  if (record.phase !== "pre" && record.phase !== "post") return null;
  if (typeof record.title !== "string" || !record.title) return null;
  return {
    id: record.id,
    phase: record.phase as TaskPhase,
    title: record.title,
    // discussion.md 22.3절: meta/week/urgent는 이제 선택 항목이다 — 없으면 ""나 false로
    // 채워 넣지 않고 그대로 undefined로 둔다("값이 있는데 비어 있음"과 "값 자체가 없음"은
    // 다르고, 화면은 후자일 때만 그 자리를 완전히 비운다).
    meta: typeof record.meta === "string" ? record.meta : undefined,
    week: typeof record.week === "boolean" ? record.week : undefined,
    urgent: typeof record.urgent === "boolean" ? record.urgent : undefined,
    tag: typeof record.tag === "string" ? record.tag : "",
    body: typeof record.body === "string" ? record.body : "",
    items: Array.isArray(record.items) ? record.items.filter((item): item is string => typeof item === "string") : [],
    done: typeof record.done === "boolean" ? record.done : false,
    // discussion.md 23.7절(PM 실측): 저장할 때는 들어가는데 읽을 때 빠져 있었다 — 추천에서
    // 고른 직후에는 메모리 객체 그대로라 출처 링크가 보이지만, 새로고침해 저장소에서 다시 읽으면
    // 사라졌다. SourceLink가 https 아닌 값을 이미 걸러내므로(17절) 문자열이면 그대로 통과시킨다.
    sourceUrl: typeof record.sourceUrl === "string" ? record.sourceUrl : undefined,
    dueDate: typeof record.dueDate === "string" ? record.dueDate : undefined,
    // discussion.md 21.2절: createdAt이 없는 레코드(손상되었거나 손으로 넣은 경우)는 버리지 않고
    // undefined로 둔다 — 정렬에서 가장 오래된 것으로 취급될 뿐, 삭제 대상은 아니다.
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
  };
}

function normalizeByCountry(raw: unknown): Record<CountryCode, Task[]> {
  const result = {} as Record<CountryCode, Task[]>;
  if (typeof raw !== "object" || raw === null) return result;
  for (const [code, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    result[code as CountryCode] = list.map(normalizeTask).filter((task): task is Task => task !== null);
  }
  return result;
}

export function readStoredCustomTasks(): Record<CountryCode, Task[]> {
  if (typeof window === "undefined") return {} as Record<CountryCode, Task[]>;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {} as Record<CountryCode, Task[]>;
    return normalizeByCountry(JSON.parse(raw));
  } catch {
    return {} as Record<CountryCode, Task[]>;
  }
}

/** discussion.md 24.1절: writeStoredNotes와 같은 이유로 성공 여부를 돌려준다 — 저장이 안 됐는데
 *  이용자에게는 된 것처럼 보이면 안 된다. */
export function writeStoredCustomTasks(tasks: Record<CountryCode, Task[]>): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

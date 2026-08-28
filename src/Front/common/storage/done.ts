import type { CountryCode } from "@/Front/common/types/domain";

const STORAGE_KEY = "wabi:done";

/**
 * discussion.md 35.2절/35.3절: 완료 표시는 이 앱의 중심(준비 진행률)인데 저장 계층이 아예
 * 없었다 — toggleTask가 메모리 상태만 바꾸고 아무 데도 쓰지 않아 새로고침하면 전부 해제됐다.
 * notes.ts의 normalize와 같은 방식으로 손상된 값을 걸러낸다 — 국가 코드 자리의 값이 객체가
 * 아니거나, 그 안의 값이 boolean이 아닌 항목은 버린다. 국가별로 나뉜 지금 상태 모양
 * (Record<CountryCode, Record<string, boolean>>)을 그대로 저장한다 — 호주에서 체크한 것이
 * 캐나다로 넘어가면 안 된다.
 */
function normalize(raw: unknown): Record<CountryCode, Record<string, boolean>> {
  const result = {} as Record<CountryCode, Record<string, boolean>>;
  if (typeof raw !== "object" || raw === null) return result;

  for (const [code, map] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof map !== "object" || map === null) continue;
    const cleaned: Record<string, boolean> = {};
    for (const [taskId, value] of Object.entries(map as Record<string, unknown>)) {
      if (typeof value === "boolean") cleaned[taskId] = value;
    }
    result[code as CountryCode] = cleaned;
  }
  return result;
}

export function readStoredDone(): Record<CountryCode, Record<string, boolean>> {
  if (typeof window === "undefined") return {} as Record<CountryCode, Record<string, boolean>>;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {} as Record<CountryCode, Record<string, boolean>>;
    return normalize(JSON.parse(raw));
  } catch {
    return {} as Record<CountryCode, Record<string, boolean>>;
  }
}

/** discussion.md 35.3절: writeStoredNotes와 같은 방식으로 성공 여부를 돌려준다(24.1절). */
export function writeStoredDone(data: Record<CountryCode, Record<string, boolean>>): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

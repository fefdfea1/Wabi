import { COUNTRIES } from "@/Front/common/data/tasks";
import type { CountryCode } from "@/Front/common/types/domain";

const STORAGE_KEY = "wabi:country";

/**
 * discussion.md 35.3절: 고른 국가를 메모·출국일과 같은 방식(localStorage)으로 저장한다 — 새
 * 저장소를 발명하지 않는다. 저장된 값이 COUNTRIES에 없는 코드면(손상되었거나 예전 국가 목록이
 * 바뀐 경우) 무시하고 null을 돌려준다 — 호출부가 기본값(COUNTRIES[0])으로 물러선다.
 */
export function readStoredCountry(): CountryCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return COUNTRIES.some((c) => c.code === raw) ? (raw as CountryCode) : null;
  } catch {
    return null;
  }
}

/** discussion.md 35.3절: writeStoredNotes와 같은 방식으로 성공 여부를 돌려준다(24.1절). */
export function writeStoredCountry(code: CountryCode): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
    return true;
  } catch {
    return false;
  }
}

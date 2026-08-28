import type { NoteRecord } from "@/Front/common/types/domain";

const STORAGE_KEY = "wabi:notes";

/**
 * discussion.md 16.2절: 메모는 짧은 텍스트라 IndexedDB 대신 localStorage에 저장한다
 * (테마·출국일·직접 추가한 할 일과 같은 자리). SecurityReview.md 2절 기준: 이용자가 스스로
 * 적는 자유 텍스트이고 구조화된 개인식별정보 필드가 아니며 서버로 전송되지 않는다.
 */
/**
 * 캔버스 06절로 title 필드가 추가되기 전에 저장된 레코드({id, body, updatedAt})는 title이
 * 아예 없을 수 있다. 읽을 때 빈 문자열로 채워 넣어 나머지 코드가 title이 항상 있다고
 * 가정해도 깨지지 않게 한다.
 */
function normalize(raw: unknown): NoteRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id) return null;
  return {
    id: record.id,
    title: typeof record.title === "string" ? record.title : "",
    body: typeof record.body === "string" ? record.body : "",
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
  };
}

export function readStoredNotes(): NoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((n): n is NoteRecord => n !== null);
  } catch {
    return [];
  }
}

export function writeStoredNotes(notes: NoteRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // 프라이빗 모드 등 저장소 접근이 막힌 환경에서는 조용히 무시한다(theme/departureDate와 동일 패턴).
  }
}

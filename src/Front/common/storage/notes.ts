import type { NoteRecord } from "@/Front/common/types/domain";

const STORAGE_KEY = "wabi:notes";

/**
 * discussion.md 16.2절: 메모는 짧은 텍스트라 IndexedDB 대신 localStorage에 저장한다
 * (테마·출국일·직접 추가한 할 일과 같은 자리). SecurityReview.md 2절 기준: 이용자가 스스로
 * 적는 자유 텍스트이고 구조화된 개인식별정보 필드가 아니며 서버로 전송되지 않는다.
 */
/**
 * discussion.md 19.7절: 한때 title 필드가 있던 레코드({id, title, body, updatedAt})가 저장되어
 * 있을 수 있다. 읽을 때 title은 그냥 무시한다 — 남아 있어도 깨지지 않을 뿐, 되살려 쓰지 않는다.
 */
function normalize(raw: unknown): NoteRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id) return null;
  return {
    id: record.id,
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

/** discussion.md 24.1절: 저장 실패(용량 초과·프라이빗 모드 등)를 조용히 삼키지 않는다 —
 *  writeStoredAvatar와 같은 방식으로 성공 여부를 호출부에 알린다. */
export function writeStoredNotes(notes: NoteRecord[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

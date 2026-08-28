/**
 * discussion.md 24.2절: `note-${Date.now()}` 같은 밀리초 기반 id는 같은 밀리초에 두 개가
 * 만들어지면 겹친다 — 그러면 하나를 지울 때 filter가 같은 id를 가진 항목을 전부(둘 다) 지운다.
 * `crypto.randomUUID()`를 쓰되, 이 함수는 보안 컨텍스트(https 또는 localhost)에서만 있으므로
 * 없는 환경에서는 시각과 난수를 섞은 값으로 물러선다.
 */
export function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

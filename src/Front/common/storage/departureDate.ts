const STORAGE_KEY = "wabi:departureDate";

/**
 * 출국일(ISO yyyy-mm-dd)을 localStorage에 보관한다. SecurityReview.md 2절 기준:
 * 개인식별정보(PII)가 아닌 앱 도메인 값이라 저장 가능하고, 서버로 전송되지 않는다.
 */
export function readStoredDepartureDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredDepartureDate(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 프라이빗 모드 등 저장소 접근이 막힌 환경에서는 조용히 무시한다.
  }
}

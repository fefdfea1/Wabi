const STORAGE_KEY = "wabi:avatar";

/** discussion.md 20.6절: 캔버스 crop + 축소를 거친 결과만 받는다. SVG는 받지 않는다. */
export const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp";
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const OUTPUT_SIZE = 256;
const OUTPUT_QUALITY = 0.8;

/**
 * discussion.md 20.6절: localStorage는 문자열 전용이라 base64로 약 33% 부풀고 오리진당 한도가
 * 5MB 안팎이며 테마·출국일·메모와 나눠 쓴다. 원본 사진(2~5MB)을 그대로 넣으면 바로 한도를
 * 넘긴다 — 그래서 저장 전에 반드시 정사각 크롭 + 256×256 축소 + webp 재인코딩을 거친다.
 * 결과가 원본이 아니라 canvas로 다시 그린 래스터라, 16절의 매직 넘버 검증만큼 무겁게 갈
 * 필요는 없다. accept 속성과 img.onerror만으로 충분하다.
 */
export function processAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      reject(new Error("png, jpeg, webp 형식만 지원합니다."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("이미지를 처리할 수 없습니다."));
        return;
      }
      ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      resolve(canvas.toDataURL("image/webp", OUTPUT_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    img.src = objectUrl;
  });
}

export function readStoredAvatar(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** discussion.md 20.6절: 저장 실패(용량 초과 등)를 조용히 삼키지 않는다 — 실패를 호출부에 알린다. */
export function writeStoredAvatar(dataUrl: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, dataUrl);
    return true;
  } catch {
    return false;
  }
}

export function clearStoredAvatar(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 프라이빗 모드 등 저장소 접근이 막힌 환경에서는 조용히 무시한다(theme/departureDate와 동일 패턴).
  }
}

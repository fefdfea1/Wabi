import styles from "./SourceLink.module.css";

export interface SourceLinkProps {
  url?: string;
}

/**
 * discussion.md 13절: 상세 화면 4곳에서만 출처를 보여준다. sourceUrl이 없으면(선택 필드) 아무것도
 * 렌더하지 않는다 — 빈 줄이나 "출처 없음" 문구를 넣지 않는다. 도메인만 뽑아 링크 문구에 함께 보여줘
 * 화면에서도, 스크린리더로 링크만 훑을 때도 어디서 온 정보인지 구분되게 한다.
 *
 * discussion.md 17절 / SecurityReview.md 9절: URL 스킴도 검사한다. https 전용 규칙이 데이터
 * 규율(모든 sourceUrl은 https)에만 의존하면, 조사 결과에 http URL이 섞여 들어와도 그대로
 * 렌더된다 — protocol이 "https:"가 아니면 파싱 실패와 같은 방식으로 아무것도 렌더하지 않는다.
 */
export function SourceLink({ url }: SourceLinkProps) {
  if (!url) return null;

  let domain: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    domain = parsed.hostname;
  } catch {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
      aria-label={`출처 ${domain}, 새 탭에서 열림`}
    >
      출처 <span className={styles.domain}>{domain}</span>
    </a>
  );
}

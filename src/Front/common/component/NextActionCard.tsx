import styles from "./NextActionCard.module.css";

export interface NextActionCardProps {
  title: string;
  /** discussion.md 37.1절: 이용자가 직접 적은 할 일은 비어 있을 수 있다 — 빈 줄이나 대체
   *  문구를 넣지 않고 그 자리를 아예 그리지 않는다. 추천에서 고른 할 일은 조사 본문의 첫
   *  문장이 그대로 있다. */
  description: string;
  /** discussion.md 37.2절: 버튼이 있던 자리에 이제 설정한 기한(meta)을 보여준다. 없으면
   *  자리를 비운다("기한 없음" 같은 문구를 만들지 않는다). */
  dueLabel?: string;
  urgent?: boolean;
}

/**
 * discussion.md 4절: 1.5px ink 테두리, radius 16~18, NEXT 캡션 + 제목 + 설명 + 기한.
 * discussion.md 37절: "지금 하기" 버튼과 지어낸 설명 문구를 없앴다 — 이 카드는 더 이상 누르는
 * 곳이 아니다(37.3절: 상세로 가는 길은 사용자 확인을 받는 중이라 TaskDetailScreen 자체는
 * 그대로 둔다). 기한 자리는 버튼처럼 보이면 안 되므로 테두리·배경·cursor:pointer를 주지 않는다.
 */
export function NextActionCard({ title, description, dueLabel, urgent }: NextActionCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.texts}>
        <span className={styles.caption}>NEXT</span>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {dueLabel ? (
        <span className={[styles.due, urgent ? styles.dueUrgent : ""].filter(Boolean).join(" ")}>{dueLabel}</span>
      ) : null}
    </div>
  );
}

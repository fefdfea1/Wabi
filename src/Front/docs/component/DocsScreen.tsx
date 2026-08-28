import { Chip } from "@/Front/common/component/Chip";
import type { DocItem } from "@/Front/common/types/domain";
import styles from "./DocsScreen.module.css";

export interface DocsScreenProps {
  docs: DocItem[];
  onOpenAddFile: () => void;
}

/** 문서 화면. 파일 이름과 만료일만 보여준다(discussion.md 5절) — 미리보기는 이번 범위 밖. */
export function DocsScreen({ docs, onOpenAddFile }: DocsScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>문서</h1>
        <button type="button" className={styles.addButton} onClick={onOpenAddFile} aria-label="파일 추가">
          <span aria-hidden="true" className={styles.plusVertical} />
          <span aria-hidden="true" className={styles.plusHorizontal} />
        </button>
      </header>

      <p className={styles.intro}>입국 심사와 계약에서 자주 요구되는 서류만 모아둡니다.</p>

      <div className={styles.list}>
        {docs.length === 0 ? (
          <p className={styles.empty}>추가된 문서가 없습니다.</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className={styles.row}>
              <Chip label={doc.ext} />
              <div className={styles.texts}>
                <span className={styles.name}>{doc.name}</span>
                <span className={styles.meta}>{doc.meta}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

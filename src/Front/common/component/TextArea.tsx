import type { TextareaHTMLAttributes } from "react";
import styles from "./TextArea.module.css";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * discussion.md 16.3절: TextField의 규격(radius 14, sunken 배경, 1.5px line 테두리, 15px)을
 * 그대로 따르되 높이만 늘리고 세로 리사이즈를 막는다(메모처럼 여러 줄 입력용).
 */
export function TextArea({ className, ...rest }: TextAreaProps) {
  return <textarea {...rest} className={[styles.field, className].filter(Boolean).join(" ")} />;
}

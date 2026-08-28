import type { InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

/** discussion.md 4절: 높이 54, radius 14, sunken 배경 + 1.5px line 테두리. */
export function TextField({ className, ...rest }: TextFieldProps) {
  return <input {...rest} className={[styles.field, className].filter(Boolean).join(" ")} />;
}

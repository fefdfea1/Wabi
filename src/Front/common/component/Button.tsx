import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const classes = [styles[variant], className].filter(Boolean).join(" ");
  return <button type="button" className={classes} {...rest} />;
}

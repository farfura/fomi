import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.css";

export function Skeleton({ className, style, children }) {
  return (
    <div aria-hidden className={cn(styles.skeleton, className)} style={style}>
      {children}
    </div>
  );
}

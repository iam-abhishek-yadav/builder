import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Lightweight section wrapper — keeps content always visible. */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}

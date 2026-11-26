import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-6 place-items-center rounded-md bg-foreground font-mono text-[11px] font-bold text-background">
        b1
      </span>
      <span className="hidden sm:inline">Builder One Stop</span>
    </Link>
  );
}

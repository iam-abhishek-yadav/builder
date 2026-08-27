import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LaunchWeek } from "@/lib/launch-week";
import { adjacentWeeks, listVisibleWeeks } from "@/lib/launch-week";
import { cn } from "@/lib/utils";

export function WeekNav({ week }: { week: LaunchWeek }) {
  const { previous, next } = adjacentWeeks(week);
  const weeks = listVisibleWeeks(week);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={previous.href}
        aria-label="Previous week"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-none">
        {weeks.map((item) => {
          const selected = item.start === week.start;
          return (
            <Link
              key={item.start}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-3.5",
                selected
                  ? "bg-[#d9f0e3] text-[#0f6b45]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {next ? (
        <Link
          href={next.href}
          aria-label="Next week"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-5" />
        </Link>
      ) : (
        <span
          aria-disabled
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/40"
        >
          <ChevronRight className="size-5" />
        </span>
      )}
    </div>
  );
}

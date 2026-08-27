import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaunchWeek } from "@/lib/launch-week";
import { adjacentWeeks } from "@/lib/launch-week";

export function WeekNav({ week }: { week: LaunchWeek }) {
  const { previous, next } = adjacentWeeks(week);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-primary">{week.label}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {week.isCurrent ? "This week’s launches" : week.range}
        </h1>
        {week.isCurrent ? (
          <p className="mt-1 text-muted-foreground">{week.range} · UTC</p>
        ) : (
          <p className="mt-1 text-muted-foreground">
            {week.year} · UTC
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={<Link href={previous.href} />}
          aria-label="Previous week"
        >
          <ChevronLeft />
        </Button>
        {next ? (
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={<Link href={next.href} />}
            aria-label="Next week"
          >
            <ChevronRight />
          </Button>
        ) : (
          <Button variant="outline" size="icon" disabled aria-label="Next week">
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RoadmapSummary } from "@/lib/roadmaps/queries";

export function RoadmapCard({ roadmap, progress }: { roadmap: RoadmapSummary; progress?: number | null }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/25">
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        <span className="text-brand">Roadmap</span> · {roadmap.stageCount} stages · {roadmap.stepCount} steps
      </p>
      <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight">
        <Link href={`/roadmaps/${roadmap.slug}`} className="after:absolute after:inset-0">
          {roadmap.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{roadmap.summary}</p>
      <ol className="mt-4 flex flex-wrap gap-1.5">
        {roadmap.stageTitles.slice(0, 5).map((t, i) => (
          <li key={t} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{i + 1}.</span> {t}
          </li>
        ))}
        {roadmap.stageTitles.length > 5 ? (
          <li className="px-1 text-xs text-muted-foreground">+{roadmap.stageTitles.length - 5} more</li>
        ) : null}
      </ol>
      <div className="mt-auto flex items-center justify-between gap-4 pt-5 text-xs text-muted-foreground">
        {typeof progress === "number" ? (
          <span className="flex flex-1 items-center gap-2">
            <span className="h-1.5 max-w-32 flex-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
            </span>
            <span className="font-mono tabular-nums">{progress}%</span>
          </span>
        ) : (
          <span />
        )}
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
    </article>
  );
}

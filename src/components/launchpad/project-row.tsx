import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "@/components/launchpad/upvote-button";
import type { ProjectSummary } from "@/lib/launchpad/queries";

export function ProjectRow({
  project,
  rank,
  voted,
  signedIn,
}: {
  project: ProjectSummary;
  rank?: number;
  voted: boolean;
  signedIn: boolean;
}) {
  return (
    <li className="group relative flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/60">
      {rank ? (
        <span className="w-5 text-right text-sm text-muted-foreground tabular-nums">{rank}</span>
      ) : null}
      <div className="min-w-0 flex-1">
        <Link href={`/p/${project.slug}`} className="font-medium after:absolute after:inset-0">
          {project.name}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{project.tagline}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" /> {project.commentCount}
          </span>
          {project.techStack.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </div>
      {/* Sits above the stretched link so it stays clickable. */}
      <div className="relative z-10">
        <UpvoteButton
          projectId={project.id}
          count={project.voteCount}
          voted={voted}
          signedIn={signedIn}
        />
      </div>
    </li>
  );
}

export function ProjectListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-4 p-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-14 w-12 animate-pulse rounded-lg bg-muted" />
        </li>
      ))}
    </ul>
  );
}

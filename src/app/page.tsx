import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ProjectListSkeleton, ProjectRow } from "@/components/launchpad/project-row";
import { getLeaderboard, getViewerState } from "@/lib/launchpad/queries";
import { getCurrentUser } from "@/lib/session";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Launchpad</h1>
        <p className="max-w-xl text-muted-foreground">
          Ship what you build. Every day&apos;s launches, ranked by the builder community.
        </p>
      </section>
      <Suspense fallback={<ProjectListSkeleton />}>
        <Leaderboard />
      </Suspense>
    </div>
  );
}

async function Leaderboard() {
  // Read the session first: it marks this subtree as request-time, so the
  // leaderboard query runs per request (cached) instead of at build time.
  const user = await getCurrentUser();
  const days = await getLeaderboard();

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="font-medium">No launches this week yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to ship something.</p>
        <Link href="/launch" className={buttonVariants({ className: "mt-4" })}>
          Launch a project
        </Link>
      </div>
    );
  }

  const ids = days.flatMap((d) => d.projects.map((p) => p.id));
  const viewer = user ? await getViewerState(user.id, ids) : { voted: [], bookmarked: [] };
  const voted = new Set(viewer.voted);

  return (
    <div className="space-y-10">
      {days.map(({ day, label, projects }) => (
        <section key={day} className="space-y-2">
          <h2 className="px-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </h2>
          <ol className="space-y-1">
            {projects.map((p, i) => (
              <ProjectRow
                key={p.id}
                project={p}
                rank={i + 1}
                voted={voted.has(p.id)}
                signedIn={Boolean(user)}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}


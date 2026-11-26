import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectListSkeleton, ProjectRow } from "@/components/launchpad/project-row";
import { getBookmarkedProjects, getViewerState } from "@/lib/launchpad/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
      <Suspense fallback={<ProjectListSkeleton rows={3} />}>
        <BookmarkList />
      </Suspense>
    </div>
  );
}

async function BookmarkList() {
  const user = await requireUser("/bookmarks");
  const projects = await getBookmarkedProjects(user.id);
  if (projects.length === 0) {
    return <p className="text-muted-foreground">Nothing saved yet. Bookmark projects to find them here.</p>;
  }
  const { voted } = await getViewerState(user.id, projects.map((p) => p.id));
  return (
    <ul className="space-y-1">
      {projects.map((p) => (
        <ProjectRow key={p.id} project={p} voted={voted.includes(p.id)} signedIn />
      ))}
    </ul>
  );
}

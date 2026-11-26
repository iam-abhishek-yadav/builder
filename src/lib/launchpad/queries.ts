import "server-only";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { bookmark, comment, project, user, vote } from "@/db/schema";
import { profileTags } from "@/lib/profiles/tags";
import { tags } from "./tags";

const LEADERBOARD_DAYS = 7;

// Correlated subqueries are written with explicit qualifiers: Drizzle omits table
// names in single-table selects, which would make `"id"` resolve to the inner table.
const voteCount = sql<number>`(select count(*) from "vote" v where v."project_id" = "project"."id")`.mapWith(Number);
const commentCount = sql<number>`(select count(*) from "comment" c where c."project_id" = "project"."id")`.mapWith(Number);

const projectSummaryFields = {
  id: project.id,
  slug: project.slug,
  name: project.name,
  tagline: project.tagline,
  techStack: project.techStack,
  launchedAt: project.launchedAt,
  voteCount,
  commentCount,
};

export type ProjectSummary = Awaited<ReturnType<typeof getLeaderboard>>[number]["projects"][number];

/** Projects from the last week, grouped by UTC launch day and ranked by votes. */
export async function getLeaderboard() {
  "use cache";
  cacheTag(tags.projects);
  cacheLife("minutes");

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (LEADERBOARD_DAYS - 1));

  const rows = await db
    .select(projectSummaryFields)
    .from(project)
    .where(gte(project.launchedAt, since))
    .orderBy(desc(voteCount), desc(project.launchedAt))
    .limit(300);

  const days = new Map<string, typeof rows>();
  for (const row of rows) {
    const day = row.launchedAt.toISOString().slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), row]);
  }
  // Labels are computed here, inside the cache scope: reading the current time
  // during render is not allowed with Cache Components. They may lag by up to the
  // cache lifetime (minutes) around UTC midnight.
  return [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, projects]) => ({ day, label: dayLabel(day), projects }));
}

function dayLabel(day: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheTag(tags.projects, tags.project(slug), profileTags.profiles);
  cacheLife("minutes");

  const [row] = await db
    .select({
      ...projectSummaryFields,
      description: project.description,
      websiteUrl: project.websiteUrl,
      repoUrl: project.repoUrl,
      maker: { id: user.id, name: user.name, image: user.image, handle: user.handle, publicId: user.publicId },
    })
    .from(project)
    .innerJoin(user, eq(user.id, project.makerId))
    .where(eq(project.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getComments(projectId: string) {
  "use cache";
  cacheTag(tags.comments(projectId), profileTags.profiles);
  cacheLife("minutes");

  return db
    .select({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: { id: user.id, name: user.name, image: user.image, handle: user.handle, publicId: user.publicId },
    })
    .from(comment)
    .innerJoin(user, eq(user.id, comment.userId))
    .where(eq(comment.projectId, projectId))
    .orderBy(comment.createdAt);
}

/** Which of the given projects the viewer has upvoted / bookmarked. */
export async function getViewerState(userId: string, projectIds: string[]) {
  if (projectIds.length === 0) return { voted: [] as string[], bookmarked: [] as string[] };
  return getViewerStateCached(userId, [...projectIds].sort());
}

async function getViewerStateCached(userId: string, projectIds: string[]) {
  "use cache";
  cacheTag(tags.viewer(userId));
  cacheLife("minutes");

  const [votes, bookmarks] = await Promise.all([
    db
      .select({ projectId: vote.projectId })
      .from(vote)
      .where(and(eq(vote.userId, userId), inArray(vote.projectId, projectIds))),
    db
      .select({ projectId: bookmark.projectId })
      .from(bookmark)
      .where(and(eq(bookmark.userId, userId), inArray(bookmark.projectId, projectIds))),
  ]);
  return {
    voted: votes.map((v) => v.projectId),
    bookmarked: bookmarks.map((b) => b.projectId),
  };
}

export async function getBookmarkedProjects(userId: string) {
  "use cache";
  cacheTag(tags.projects, tags.viewer(userId));
  cacheLife("minutes");

  return db
    .select(projectSummaryFields)
    .from(bookmark)
    .innerJoin(project, eq(project.id, bookmark.projectId))
    .where(eq(bookmark.userId, userId))
    .orderBy(desc(bookmark.createdAt));
}

/** Every project a builder launched, newest first (for their profile). */
export async function getProjectsByMaker(makerId: string) {
  "use cache";
  cacheTag(tags.projects);
  cacheLife("minutes");

  return db
    .select(projectSummaryFields)
    .from(project)
    .where(eq(project.makerId, makerId))
    .orderBy(desc(project.launchedAt))
    .limit(100);
}

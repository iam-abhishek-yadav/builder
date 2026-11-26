import "server-only";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { roadmap, roadmapProgress, user } from "@/db/schema";
import { getProjectsByMaker } from "@/lib/launchpad/queries";
import { parseOutline } from "@/lib/roadmaps/outline";
import { roadmapTags } from "@/lib/roadmaps/tags";
import { profileTags } from "./tags";

const publicProfileFields = {
  id: user.id,
  name: user.name,
  image: user.image,
  handle: user.handle,
  publicId: user.publicId,
  headline: user.headline,
  bio: user.bio,
  links: user.links,
  openToWork: user.openToWork,
  workTypes: user.workTypes,
  workRoles: user.workRoles,
  workLocations: user.workLocations,
  workCity: user.workCity,
  showRoadmapProgress: user.showRoadmapProgress,
  showPracticeProgress: user.showPracticeProgress,
  createdAt: user.createdAt,
};

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getProfileByKey>>>;

/** Looks a profile up by handle or by permanent public id (both lowercase). */
export async function getProfileByKey(key: string) {
  "use cache";
  cacheTag(profileTags.profiles);
  cacheLife("hours");

  const k = key.toLowerCase();
  const [row] = await db
    .select(publicProfileFields)
    .from(user)
    .where(or(eq(user.handle, k), eq(user.publicId, k)))
    // A handle match wins over an id match (handles can't equal an existing id, but be safe).
    .orderBy(sql`case when ${user.handle} = ${k} then 0 else 1 end`)
    .limit(1);
  if (!row) return null;
  cacheTag(profileTags.profile(row.id));
  return row;
}

/** Launches plus skills derived from their tech stacks. */
export async function getProfileWork(userId: string) {
  const launches = await getProjectsByMaker(userId);
  const counts = new Map<string, number>();
  for (const p of launches) for (const t of p.techStack) counts.set(t, (counts.get(t) ?? 0) + 1);
  const skills = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, projects]) => ({ name, projects }));
  const totalVotes = launches.reduce((n, p) => n + p.voteCount, 0);
  return { launches, skills, totalVotes };
}

/** Roadmaps the builder has started, with core-step completion and finished badges. */
export async function getProfileRoadmaps(userId: string) {
  "use cache";
  cacheTag(roadmapTags.roadmaps, roadmapTags.progress(userId));
  cacheLife("minutes");

  const progress = await db
    .select({ roadmapId: roadmapProgress.roadmapId, itemKey: roadmapProgress.itemKey })
    .from(roadmapProgress)
    .where(eq(roadmapProgress.userId, userId));
  if (progress.length === 0) return [];

  const ids = [...new Set(progress.map((p) => p.roadmapId))];
  const roadmaps = await db
    .select({ id: roadmap.id, slug: roadmap.slug, title: roadmap.title, outline: roadmap.outline })
    .from(roadmap)
    .where(and(inArray(roadmap.id, ids), eq(roadmap.status, "published")));

  return roadmaps
    .map((r) => {
      const done = new Set(progress.filter((p) => p.roadmapId === r.id).map((p) => p.itemKey));
      const steps = parseOutline(r.outline).stages.flatMap((s) => s.steps);
      const core = steps.filter((s) => s.kind === "core");
      const coreDone = core.filter((s) => done.has(s.key)).length;
      const percent = core.length ? Math.round((coreDone / core.length) * 100) : 0;
      return { slug: r.slug, title: r.title, percent, coreDone, coreTotal: core.length, finished: core.length > 0 && coreDone === core.length };
    })
    .filter((r) => r.coreDone > 0)
    .sort((a, b) => Number(b.finished) - Number(a.finished) || b.percent - a.percent);
}

/** The signed-in user's editable profile (settings page). Uncached. */
export async function getEditableProfile(userId: string) {
  const [row] = await db.select(publicProfileFields).from(user).where(eq(user.id, userId)).limit(1);
  return row ?? null;
}

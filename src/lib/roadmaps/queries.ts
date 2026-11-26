import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { article, roadmap, roadmapProgress } from "@/db/schema";
import { learnTags } from "@/lib/learn/tags";
import { parseOutline } from "./outline";
import { roadmapTags } from "./tags";

/** Published roadmaps with their parsed step counts, featured first. */
export async function getPublishedRoadmaps(limit = 50) {
  "use cache";
  cacheTag(roadmapTags.roadmaps);
  cacheLife("hours");

  const rows = await db
    .select({
      id: roadmap.id,
      slug: roadmap.slug,
      title: roadmap.title,
      summary: roadmap.summary,
      outline: roadmap.outline,
      featured: roadmap.featured,
    })
    .from(roadmap)
    .where(eq(roadmap.status, "published"))
    .orderBy(desc(roadmap.featured), desc(roadmap.publishedAt))
    .limit(limit);

  return rows.map(({ outline, ...r }) => {
    const parsed = parseOutline(outline);
    return {
      ...r,
      stageCount: parsed.stages.length,
      stepCount: parsed.stepCount,
      stepKeys: parsed.stepKeys,
      stageTitles: parsed.stages.map((s) => s.title),
    };
  });
}

export type RoadmapSummary = Awaited<ReturnType<typeof getPublishedRoadmaps>>[number];

export async function getPublishedRoadmap(slug: string) {
  "use cache";
  cacheTag(roadmapTags.roadmaps, roadmapTags.roadmap(slug), learnTags.articles);
  cacheLife("hours");

  const [row] = await db
    .select({
      id: roadmap.id,
      slug: roadmap.slug,
      title: roadmap.title,
      summary: roadmap.summary,
      outline: roadmap.outline,
      updatedAt: roadmap.updatedAt,
    })
    .from(roadmap)
    .where(and(eq(roadmap.slug, slug), eq(roadmap.status, "published")))
    .limit(1);
  if (!row) return null;

  const parsed = parseOutline(row.outline);
  const articles = await getLinkedArticles(parsed.stages.flatMap((s) => s.steps.flatMap((st) => st.articleSlugs)));
  return { ...row, parsed, articles };
}

/** Titles for `learn:` links that point at published articles; unknown/draft slugs are dropped. */
export async function getLinkedArticles(slugs: string[]) {
  const unique = [...new Set(slugs)];
  if (unique.length === 0) return {} as Record<string, string>;
  const rows = await db
    .select({ slug: article.slug, title: article.title })
    .from(article)
    .where(and(inArray(article.slug, unique), eq(article.status, "published")));
  return Object.fromEntries(rows.map((r) => [r.slug, r.title])) as Record<string, string>;
}

/** Step keys the user has completed on one roadmap. */
export async function getRoadmapProgress(userId: string, roadmapId: string) {
  "use cache";
  cacheTag(roadmapTags.progress(userId));
  cacheLife("minutes");

  const rows = await db
    .select({ itemKey: roadmapProgress.itemKey })
    .from(roadmapProgress)
    .where(and(eq(roadmapProgress.userId, userId), eq(roadmapProgress.roadmapId, roadmapId)));
  return rows.map((r) => r.itemKey);
}

/** Completed-step keys per roadmap for the list page. */
export async function getAllRoadmapProgress(userId: string) {
  "use cache";
  cacheTag(roadmapTags.progress(userId));
  cacheLife("minutes");

  const rows = await db
    .select({ roadmapId: roadmapProgress.roadmapId, itemKey: roadmapProgress.itemKey })
    .from(roadmapProgress)
    .where(eq(roadmapProgress.userId, userId));
  const map: Record<string, string[]> = {};
  for (const r of rows) (map[r.roadmapId] ??= []).push(r.itemKey);
  return map;
}

// ---- Studio (admin only; callers must check requireAdmin first). Uncached. ----

export async function listAllRoadmaps() {
  return db
    .select({
      id: roadmap.id,
      slug: roadmap.slug,
      title: roadmap.title,
      status: roadmap.status,
      featured: roadmap.featured,
      updatedAt: roadmap.updatedAt,
    })
    .from(roadmap)
    .orderBy(desc(roadmap.updatedAt));
}

export async function getRoadmapForEdit(id: string) {
  const [row] = await db.select().from(roadmap).where(eq(roadmap.id, id)).limit(1);
  return row ?? null;
}

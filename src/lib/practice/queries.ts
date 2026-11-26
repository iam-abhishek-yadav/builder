import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { problemProgress, sheet } from "@/db/schema";
import { sheetStats } from "./sheet";
import { practiceTags } from "./tags";

/** Published sheets with problem counts, featured first. */
export async function getPublishedSheets() {
  "use cache";
  cacheTag(practiceTags.sheets);
  cacheLife("hours");

  const rows = await db
    .select({ id: sheet.id, slug: sheet.slug, title: sheet.title, summary: sheet.summary, topics: sheet.topics, featured: sheet.featured })
    .from(sheet)
    .where(eq(sheet.status, "published"))
    .orderBy(desc(sheet.featured), desc(sheet.publishedAt));
  return rows.map(({ topics, ...r }) => ({
    ...r,
    topicNames: topics.map((t) => t.name),
    ...sheetStats(topics),
  }));
}

export type SheetSummary = Awaited<ReturnType<typeof getPublishedSheets>>[number];

export async function getPublishedSheet(slug: string) {
  "use cache";
  cacheTag(practiceTags.sheets, practiceTags.sheet(slug));
  cacheLife("hours");

  const [row] = await db
    .select({
      id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      summary: sheet.summary,
      topics: sheet.topics,
      sourceName: sheet.sourceName,
      sourceUrl: sheet.sourceUrl,
    })
    .from(sheet)
    .where(and(eq(sheet.slug, slug), eq(sheet.status, "published")))
    .limit(1);
  return row ? { ...row, stats: sheetStats(row.topics) } : null;
}

export type ProblemState = { solvedAt: string | null; starred: boolean };

/** Every problem the builder has solved or starred, keyed by problem key. */
export async function getProblemStates(userId: string): Promise<Record<string, ProblemState>> {
  "use cache";
  cacheTag(practiceTags.progress(userId));
  cacheLife("minutes");

  const rows = await db
    .select({ key: problemProgress.problemKey, solvedAt: problemProgress.solvedAt, starred: problemProgress.starred })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId));
  return Object.fromEntries(rows.map((r) => [r.key, { solvedAt: r.solvedAt?.toISOString() ?? null, starred: r.starred }]));
}

/** Per-sheet solved counts for a builder (profile + sheet list). */
export async function getSheetProgress(userId: string) {
  const [sheets, states] = await Promise.all([getPublishedSheets(), getProblemStates(userId)]);
  return sheets.map((s) => {
    const solved = s.keys.filter((k) => states[k]?.solvedAt).length;
    return { slug: s.slug, title: s.title, solved, total: s.total, percent: s.total ? Math.round((solved / s.total) * 100) : 0 };
  });
}

// ---- Studio (admin only; callers must check requireAdmin first). Uncached. ----

export async function listAllSheets() {
  return db
    .select({ id: sheet.id, slug: sheet.slug, title: sheet.title, status: sheet.status, featured: sheet.featured, topics: sheet.topics, updatedAt: sheet.updatedAt })
    .from(sheet)
    .orderBy(desc(sheet.updatedAt));
}

export async function getSheetForEdit(id: string) {
  const [row] = await db.select().from(sheet).where(eq(sheet.id, id)).limit(1);
  return row ?? null;
}

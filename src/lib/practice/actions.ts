"use server";

import { and, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { problemProgress, sheet, type SheetProblem } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { profileTags } from "@/lib/profiles/tags";
import { getCurrentUser } from "@/lib/session";
import { getPublishedSheets } from "./queries";
import { topicsSchema } from "./sheet";
import { practiceTags } from "./tags";

// ---- Reader progress ----

/** Marks a problem solved/unsolved and/or starred for the signed-in builder. */
export async function setProblemState(key: string, patch: { solved?: boolean; starred?: boolean }) {
  const me = await getCurrentUser();
  if (!me) return { ok: false as const, error: "Sign in to track progress" };
  if (typeof key !== "string" || key.length > 120) return { ok: false as const, error: "Bad request" };

  // Only problems that appear in a published sheet can be tracked.
  const known = (await getPublishedSheets()).some((s) => s.keys.includes(key));
  if (!known) return { ok: false as const, error: "Unknown problem" };

  const where = and(eq(problemProgress.userId, me.id), eq(problemProgress.problemKey, key));
  const [current] = await db.select().from(problemProgress).where(where).limit(1);
  const solvedAt =
    patch.solved === undefined ? (current?.solvedAt ?? null) : patch.solved ? (current?.solvedAt ?? new Date()) : null;
  const starred = patch.starred ?? current?.starred ?? false;

  if (!solvedAt && !starred) {
    await db.delete(problemProgress).where(where);
  } else {
    await db
      .insert(problemProgress)
      .values({ userId: me.id, problemKey: key, solvedAt, starred })
      .onConflictDoUpdate({ target: [problemProgress.userId, problemProgress.problemKey], set: { solvedAt, starred } });
  }
  updateTag(practiceTags.progress(me.id));
  updateTag(profileTags.profile(me.id));
  return { ok: true as const, solvedAt: solvedAt?.toISOString() ?? null, starred };
}

// ---- Studio ----

const sheetSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(100, "At most 100 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
    .or(z.literal("")),
  summary: z.string().trim().min(20, "At least 20 characters").max(300, "At most 300 characters"),
  sourceName: z.string().trim().max(80).transform((v) => v || null),
  sourceUrl: z
    .union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a valid http(s) URL" })])
    .transform((v) => v || null),
  featured: z.string().optional().transform((v) => v === "on"),
});

export type SheetFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.input<typeof sheetSchema> | "topics", string[]>>;
  status?: "draft" | "published";
  slug?: string;
};

export async function saveSheet(sheetId: string | null, _prev: SheetFormState, formData: FormData): Promise<SheetFormState> {
  await requireAdmin();
  const author = await getCurrentUser();
  if (!author) return { error: "Sign in again." };

  const parsed = sheetSchema.safeParse(
    Object.fromEntries(["title", "slug", "summary", "sourceName", "sourceUrl", "featured"].map((k) => [k, String(formData.get(k) ?? "")])),
  );
  let rawTopics: unknown;
  try {
    rawTopics = JSON.parse(String(formData.get("topics") ?? "[]"));
  } catch {
    rawTopics = null;
  }
  const topics = topicsSchema.safeParse(rawTopics);
  if (!parsed.success || !topics.success) {
    return {
      error: "Fix the highlighted fields.",
      fieldErrors: {
        ...(parsed.success ? {} : z.flattenError(parsed.error).fieldErrors),
        ...(topics.success ? {} : { topics: [...new Set(topics.error.issues.map((i) => i.message))] }),
      },
    };
  }
  if (sheetId && !z.uuid().safeParse(sheetId).success) return { error: "Sheet not found." };

  const existing = sheetId ? (await db.select().from(sheet).where(eq(sheet.id, sheetId)).limit(1))[0] : undefined;
  if (sheetId && !existing) return { error: "Sheet not found." };

  const intent = String(formData.get("intent") ?? "draft");
  const slug = await uniqueSlug(parsed.data.slug || slugify(parsed.data.title), sheetId);
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (existing?.status ?? "draft");
  const row = {
    title: parsed.data.title,
    slug,
    summary: parsed.data.summary,
    topics: topics.data,
    sourceName: parsed.data.sourceName,
    sourceUrl: parsed.data.sourceUrl,
    featured: parsed.data.featured,
    status,
    publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  } as const;

  let id = sheetId;
  if (existing) {
    await db.update(sheet).set(row).where(eq(sheet.id, existing.id));
  } else {
    const [created] = await db.insert(sheet).values({ ...row, authorId: author.id }).returning({ id: sheet.id });
    id = created.id;
  }
  updateTag(practiceTags.sheets);
  updateTag(practiceTags.sheet(slug));
  if (existing && existing.slug !== slug) updateTag(practiceTags.sheet(existing.slug));

  if (!existing) redirect(`/studio/sheets/${id}?created=1`);
  const message =
    intent === "publish" ? (existing.status === "published" ? "Published changes." : "Published.")
    : intent === "unpublish" ? "Unpublished. The sheet is a draft again."
    : "Saved.";
  return { ok: true, message, status, slug };
}

export async function deleteSheet(sheetId: string) {
  await requireAdmin();
  if (!z.uuid().safeParse(sheetId).success) return;
  const [deleted] = await db.delete(sheet).where(eq(sheet.id, sheetId)).returning({ slug: sheet.slug });
  if (deleted) {
    updateTag(practiceTags.sheets);
    updateTag(practiceTags.sheet(deleted.slug));
  }
  redirect("/studio/sheets");
}

/**
 * Admin helper: fetch the problems of a public LeetCode problem list (titles, links,
 * difficulty, premium flag) so a sheet doesn't have to be typed in by hand. Uses
 * LeetCode's public GraphQL endpoint; problem statements are never copied.
 */
export async function importLeetCodeList(listUrl: string): Promise<{ ok: true; problems: Omit<SheetProblem, "key">[] } | { ok: false; error: string }> {
  await requireAdmin();
  const m = /leetcode\.com\/problem-list\/([a-z0-9-]+)/i.exec(listUrl);
  if (!m) return { ok: false, error: "Paste a link like https://leetcode.com/problem-list/abc123/" };
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", referer: `https://leetcode.com/problem-list/${m[1]}/`, "user-agent": "Mozilla/5.0" },
      body: JSON.stringify({
        query:
          "query($slug:String!){ favoriteQuestionList(favoriteSlug:$slug, limit:500, skip:0){ questions { title titleSlug difficulty paidOnly } } }",
        variables: { slug: m[1] },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await res.json()) as {
      data?: { favoriteQuestionList?: { questions: { title: string; titleSlug: string; difficulty: string; paidOnly: boolean }[] } | null };
    };
    const questions = json.data?.favoriteQuestionList?.questions;
    if (!res.ok || !questions?.length) return { ok: false, error: "Couldn't read that list. Is it public?" };
    return {
      ok: true,
      problems: questions.map((q) => ({
        title: q.title,
        url: `https://leetcode.com/problems/${q.titleSlug}/`,
        difficulty: (["easy", "medium", "hard"].includes(q.difficulty.toLowerCase()) ? q.difficulty.toLowerCase() : "medium") as SheetProblem["difficulty"],
        premium: q.paidOnly,
      })),
    };
  } catch {
    return { ok: false, error: "LeetCode didn't respond. Try again, or add problems by hand." };
  }
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "sheet"
  );
}

async function uniqueSlug(base: string, selfId: string | null) {
  for (let n = 0; n < 20; n++) {
    const s = n === 0 ? base : `${base}-${n + 1}`;
    const [clash] = await db
      .select({ id: sheet.id })
      .from(sheet)
      .where(selfId ? and(eq(sheet.slug, s), ne(sheet.id, selfId)) : eq(sheet.slug, s))
      .limit(1);
    if (!clash) return s;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

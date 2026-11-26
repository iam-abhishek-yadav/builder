"use server";

import { and, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { roadmap, roadmapProgress } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { parseOutline } from "./outline";
import { roadmapTags } from "./tags";

const roadmapSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(100, "At most 100 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
    .or(z.literal("")),
  summary: z.string().trim().min(20, "At least 20 characters").max(300, "At most 300 characters"),
  outline: z.string().trim().min(10, "Add some stages and steps").max(100_000, "Outline is too long"),
  featured: z.string().optional().transform((v) => v === "on"),
});

export type RoadmapFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.input<typeof roadmapSchema>, string[]>>;
  values?: Record<string, string>;
  status?: "draft" | "published";
  slug?: string;
};

const FIELDS = ["title", "slug", "summary", "outline", "featured"] as const;

export async function saveRoadmap(
  roadmapId: string | null,
  _prev: RoadmapFormState,
  formData: FormData,
): Promise<RoadmapFormState> {
  await requireAdmin();
  const author = await getCurrentUser();
  if (!author) return { error: "Sign in again." };

  const values = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const intent = String(formData.get("intent") ?? "draft");
  const parsed = roadmapSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values, error: "Fix the highlighted fields." };
  }
  if (roadmapId && !z.uuid().safeParse(roadmapId).success) return { error: "Roadmap not found." };

  const outline = parseOutline(parsed.data.outline);
  if (intent === "publish" && outline.errors.length > 0) {
    return { values, error: "Fix the outline problems before publishing.", fieldErrors: { outline: outline.errors } };
  }

  const existing = roadmapId
    ? (await db.select().from(roadmap).where(eq(roadmap.id, roadmapId)).limit(1))[0]
    : undefined;
  if (roadmapId && !existing) return { error: "Roadmap not found." };

  const slug = await uniqueSlug(parsed.data.slug || slugify(parsed.data.title), roadmapId);
  const status =
    intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (existing?.status ?? "draft");
  const row = {
    title: parsed.data.title,
    slug,
    summary: parsed.data.summary,
    outline: parsed.data.outline,
    featured: parsed.data.featured,
    status,
    publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  } as const;

  let id = roadmapId;
  if (existing) {
    await db.update(roadmap).set(row).where(eq(roadmap.id, existing.id));
  } else {
    const [created] = await db.insert(roadmap).values({ ...row, authorId: author.id }).returning({ id: roadmap.id });
    id = created.id;
  }

  updateTag(roadmapTags.roadmaps);
  updateTag(roadmapTags.roadmap(slug));
  if (existing && existing.slug !== slug) updateTag(roadmapTags.roadmap(existing.slug));

  if (!existing) redirect(`/studio/roadmaps/${id}?created=1`);
  const message =
    intent === "publish" ? (existing.status === "published" ? "Published changes." : "Published.")
    : intent === "unpublish" ? "Unpublished. The roadmap is a draft again."
    : "Saved.";
  return { ok: true, message, status, slug, values: { ...values, slug } };
}

export async function deleteRoadmap(roadmapId: string) {
  await requireAdmin();
  if (!z.uuid().safeParse(roadmapId).success) return;
  const [deleted] = await db.delete(roadmap).where(eq(roadmap.id, roadmapId)).returning({ slug: roadmap.slug });
  if (deleted) {
    updateTag(roadmapTags.roadmaps);
    updateTag(roadmapTags.roadmap(deleted.slug));
  }
  redirect("/studio/roadmaps");
}

/** Marks a step done / not done for the signed-in reader. Only keys present in the published outline are accepted. */
export async function setStepDone(roadmapId: string, itemKey: string, done: boolean) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Sign in to track progress" };
  if (!z.uuid().safeParse(roadmapId).success || itemKey.length > 300) return { ok: false as const, error: "Bad request" };

  const [row] = await db
    .select({ outline: roadmap.outline })
    .from(roadmap)
    .where(and(eq(roadmap.id, roadmapId), eq(roadmap.status, "published")))
    .limit(1);
  if (!row || !parseOutline(row.outline).stepKeys.includes(itemKey)) return { ok: false as const, error: "Unknown step" };

  const where = and(
    eq(roadmapProgress.userId, user.id),
    eq(roadmapProgress.roadmapId, roadmapId),
    eq(roadmapProgress.itemKey, itemKey),
  );
  if (done) {
    await db.insert(roadmapProgress).values({ userId: user.id, roadmapId, itemKey }).onConflictDoNothing();
  } else {
    await db.delete(roadmapProgress).where(where);
  }
  updateTag(roadmapTags.progress(user.id));
  return { ok: true as const };
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "roadmap"
  );
}

async function uniqueSlug(base: string, selfId: string | null) {
  for (let n = 0; n < 20; n++) {
    const slug = n === 0 ? base : `${base}-${n + 1}`;
    const [clash] = await db
      .select({ id: roadmap.id })
      .from(roadmap)
      .where(selfId ? and(eq(roadmap.slug, slug), ne(roadmap.id, selfId)) : eq(roadmap.slug, slug))
      .limit(1);
    if (!clash) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

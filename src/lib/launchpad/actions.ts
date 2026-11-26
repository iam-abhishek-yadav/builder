"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { bookmark, comment, project, vote } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/session";
import { tags } from "./tags";
import { commentSchema, launchSchema, type FieldErrors } from "./validation";

const MAX_LAUNCHES_PER_DAY = 3;

export type LaunchFormState = {
  error?: string;
  fieldErrors?: FieldErrors<z.input<typeof launchSchema>>;
  values?: Record<string, string>;
};

export async function createProject(
  _prev: LaunchFormState,
  formData: FormData,
): Promise<LaunchFormState> {
  const user = await requireUser("/launch");
  const values = Object.fromEntries(
    ["name", "tagline", "description", "websiteUrl", "repoUrl", "techStack"].map((k) => [
      k,
      String(formData.get(k) ?? ""),
    ]),
  );

  const parsed = launchSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(project)
    .where(and(eq(project.makerId, user.id), gte(project.createdAt, since)));
  if (recent >= MAX_LAUNCHES_PER_DAY) {
    return { error: `You can launch up to ${MAX_LAUNCHES_PER_DAY} projects per day.`, values };
  }

  const slug = await uniqueSlug(parsed.data.name);
  await db.insert(project).values({ ...parsed.data, slug, makerId: user.id });

  updateTag(tags.projects);
  redirect(`/p/${slug}`);
}

export async function toggleVote(projectId: string) {
  return toggle(projectId, "vote");
}

export async function toggleBookmark(projectId: string) {
  return toggle(projectId, "bookmark");
}

async function toggle(projectId: string, kind: "vote" | "bookmark") {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Sign in first" };
  if (!z.uuid().safeParse(projectId).success) return { ok: false as const, error: "Bad id" };

  const table = kind === "vote" ? vote : bookmark;
  const where = and(eq(table.userId, user.id), eq(table.projectId, projectId));
  const removed = await db.delete(table).where(where).returning({ projectId: table.projectId });
  if (removed.length === 0) {
    await db.insert(table).values({ userId: user.id, projectId }).onConflictDoNothing();
  }

  updateTag(tags.viewer(user.id));
  if (kind === "vote") updateTag(tags.projects);
  return { ok: true as const, active: removed.length === 0 };
}

export type CommentFormState = { error?: string; ok?: boolean; body?: string };

export async function addComment(
  projectId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const body = String(formData.get("body") ?? "");
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to comment", body };

  const parsed = commentSchema.safeParse({ body });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, body };
  if (!z.uuid().safeParse(projectId).success) return { error: "Project not found", body };

  const [target] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);
  if (!target) return { error: "Project not found", body };

  await db.insert(comment).values({ projectId, userId: user.id, body: parsed.data.body });
  updateTag(tags.comments(projectId));
  updateTag(tags.projects);
  return { ok: true };
}

async function uniqueSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const [existing] = await db
      .select({ id: project.id })
      .from(project)
      .where(eq(project.slug, slug))
      .limit(1);
    if (!existing) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

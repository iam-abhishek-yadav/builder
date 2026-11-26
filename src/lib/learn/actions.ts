"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { article, topic } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { readingMinutes } from "./markdown";
import { learnTags } from "./tags";
import { articleSchema, topicSchema, type ArticleInput, type TopicInput } from "./validation";

export type ArticleFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof ArticleInput, string[]>>;
  values?: Record<string, string>;
  status?: "draft" | "published";
  slug?: string;
};

const FIELDS = ["title", "slug", "summary", "topicId", "tags", "body", "sourceUrl", "sourceName", "featured"] as const;

export async function saveArticle(
  articleId: string | null,
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();
  const author = await getCurrentUser();
  if (!author) return { error: "Sign in again." };

  const values = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const intent = String(formData.get("intent") ?? "draft");
  const parsed = articleSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values, error: "Fix the highlighted fields." };
  }
  if (articleId && !z.uuid().safeParse(articleId).success) return { error: "Article not found." };

  const existing = articleId
    ? (await db.select().from(article).where(eq(article.id, articleId)).limit(1))[0]
    : undefined;
  if (articleId && !existing) return { error: "Article not found." };

  const data = parsed.data;
  const [topicRow] = await db.select({ id: topic.id }).from(topic).where(eq(topic.id, data.topicId)).limit(1);
  if (!topicRow) return { fieldErrors: { topicId: ["Pick a topic"] }, values, error: "Fix the highlighted fields." };
  const slug = await uniqueSlug(data.slug || slugify(data.title), articleId);
  const status =
    intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (existing?.status ?? "draft");
  const publishedAt =
    status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

  const row = {
    title: data.title,
    slug,
    summary: data.summary,
    topicId: data.topicId,
    featured: data.featured,
    tags: data.tags,
    body: data.body,
    sourceUrl: data.sourceUrl,
    sourceName: data.sourceName,
    readingMinutes: readingMinutes(data.body),
    status,
    publishedAt,
  } as const;

  let id = articleId;
  if (existing) {
    await db.update(article).set(row).where(eq(article.id, existing.id));
  } else {
    const [created] = await db
      .insert(article)
      .values({ ...row, authorId: author.id })
      .returning({ id: article.id });
    id = created.id;
  }

  updateTag(learnTags.articles);
  updateTag(learnTags.article(slug));
  if (existing && existing.slug !== slug) updateTag(learnTags.article(existing.slug));

  if (!existing) redirect(`/studio/${id}?created=1`);

  const message =
    intent === "publish"
      ? existing.status === "published"
        ? "Published changes."
        : "Published."
      : intent === "unpublish"
        ? "Unpublished. The article is a draft again."
        : "Saved.";
  return { ok: true, message, status, slug, values: { ...values, slug } };
}

export async function deleteArticle(articleId: string) {
  await requireAdmin();
  if (!z.uuid().safeParse(articleId).success) return;
  const [deleted] = await db.delete(article).where(eq(article.id, articleId)).returning({ slug: article.slug });
  if (deleted) {
    updateTag(learnTags.articles);
    updateTag(learnTags.article(deleted.slug));
  }
  redirect("/studio");
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article"
  );
}

async function uniqueSlug(base: string, selfId: string | null) {
  for (let n = 0; n < 20; n++) {
    const slug = n === 0 ? base : `${base}-${n + 1}`;
    const [clash] = await db
      .select({ id: article.id })
      .from(article)
      .where(selfId ? and(eq(article.slug, slug), ne(article.id, selfId)) : eq(article.slug, slug))
      .limit(1);
    if (!clash) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

// ---- Topics ----

export type TopicFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof TopicInput, string[]>>;
  values?: Record<string, string>;
};

export async function saveTopic(topicId: string | null, _prev: TopicFormState, formData: FormData): Promise<TopicFormState> {
  await requireAdmin();
  const values = Object.fromEntries(["name", "slug", "description", "position"].map((k) => [k, String(formData.get(k) ?? "")]));
  const parsed = topicSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  if (topicId && !z.uuid().safeParse(topicId).success) return { error: "Topic not found.", values };

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const [clash] = await db
    .select({ id: topic.id })
    .from(topic)
    .where(topicId ? and(eq(topic.slug, slug), ne(topic.id, topicId)) : eq(topic.slug, slug))
    .limit(1);
  if (clash) return { fieldErrors: { slug: ["Another topic already uses this slug"] }, values };

  const row = { name: data.name, slug, description: data.description, position: data.position };
  if (topicId) {
    const updated = await db.update(topic).set(row).where(eq(topic.id, topicId)).returning({ id: topic.id });
    if (updated.length === 0) return { error: "Topic not found.", values };
  } else {
    await db.insert(topic).values(row);
  }
  updateTag(learnTags.topics);
  return topicId ? { ok: true, message: "Saved.", values: { ...values, slug } } : { ok: true, message: `Added “${data.name}”.` };
}

export async function deleteTopic(topicId: string): Promise<TopicFormState> {
  await requireAdmin();
  if (!z.uuid().safeParse(topicId).success) return { error: "Topic not found." };
  const [{ n }] = await db.select({ n: count() }).from(article).where(eq(article.topicId, topicId));
  if (n > 0) return { error: `Move or delete its ${n} article${n === 1 ? "" : "s"} first.` };
  await db.delete(topic).where(eq(topic.id, topicId));
  updateTag(learnTags.topics);
  return { ok: true, message: "Deleted." };
}

import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { article, topic } from "@/db/schema";
import { learnTags } from "./tags";

const listFields = {
  id: article.id,
  slug: article.slug,
  title: article.title,
  summary: article.summary,
  tags: article.tags,
  readingMinutes: article.readingMinutes,
  featured: article.featured,
  publishedAt: article.publishedAt,
  topic: { slug: topic.slug, name: topic.name },
};

export type ArticleSummary = Awaited<ReturnType<typeof getPublishedArticles>>[number];

/** Published articles, newest first; optionally limited to one topic (by slug). */
export async function getPublishedArticles({ topicSlug, limit = 100 }: { topicSlug?: string; limit?: number } = {}) {
  "use cache";
  cacheTag(learnTags.articles, learnTags.topics);
  cacheLife("hours");

  return db
    .select(listFields)
    .from(article)
    .innerJoin(topic, eq(topic.id, article.topicId))
    .where(topicSlug ? and(eq(article.status, "published"), eq(topic.slug, topicSlug)) : eq(article.status, "published"))
    .orderBy(desc(article.publishedAt))
    .limit(limit);
}

/** For the landing page: featured articles first, then the most recent. */
export async function getHighlightedArticles(limit = 6) {
  "use cache";
  cacheTag(learnTags.articles, learnTags.topics);
  cacheLife("hours");

  return db
    .select(listFields)
    .from(article)
    .innerJoin(topic, eq(topic.id, article.topicId))
    .where(eq(article.status, "published"))
    .orderBy(desc(article.featured), desc(article.publishedAt))
    .limit(limit);
}

/** Topics that have at least one published article, with counts (for public tabs). */
export async function getPublicTopics() {
  "use cache";
  cacheTag(learnTags.articles, learnTags.topics);
  cacheLife("hours");

  return db
    .select({ slug: topic.slug, name: topic.name, description: topic.description, articles: count(article.id) })
    .from(topic)
    .innerJoin(article, and(eq(article.topicId, topic.id), eq(article.status, "published")))
    .groupBy(topic.id)
    .orderBy(asc(topic.position), asc(topic.name));
}

export async function getPublishedArticle(slug: string) {
  "use cache";
  cacheTag(learnTags.articles, learnTags.topics, learnTags.article(slug));
  cacheLife("hours");

  const [row] = await db
    .select({
      ...listFields,
      body: article.body,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      updatedAt: article.updatedAt,
    })
    .from(article)
    .innerJoin(topic, eq(topic.id, article.topicId))
    .where(and(eq(article.slug, slug), eq(article.status, "published")))
    .limit(1);
  return row ?? null;
}

// ---- Studio (admin only; callers must check requireAdmin first). Uncached. ----

export async function listAllArticles() {
  return db
    .select({ ...listFields, status: article.status, updatedAt: article.updatedAt })
    .from(article)
    .innerJoin(topic, eq(topic.id, article.topicId))
    .orderBy(desc(article.updatedAt));
}

export async function getArticleForEdit(id: string) {
  const [row] = await db.select().from(article).where(eq(article.id, id)).limit(1);
  return row ?? null;
}

/** All topics with total article counts (drafts included), for Studio. */
export async function listAllTopics() {
  return db
    .select({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      position: topic.position,
      articles: count(article.id),
    })
    .from(topic)
    .leftJoin(article, eq(article.topicId, topic.id))
    .groupBy(topic.id)
    .orderBy(asc(topic.position), asc(topic.name));
}

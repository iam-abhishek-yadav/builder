import { relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./users";

export const articleStatus = pgEnum("article_status", ["draft", "published"]);

/** Learn topics (System design, Case studies, DSA, ...). Managed by admins in Studio. */
export const topic = pgTable("topic", {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull().default(""),
  /** Lower comes first in tabs and lists. */
  position: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const article = pgTable(
  "article",
  {
    id: uuid().defaultRandom().primaryKey(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull(),
    topicId: uuid()
      .notNull()
      .references(() => topic.id, { onDelete: "restrict" }),
    tags: text().array().notNull().default([]),
    /** Markdown (GitHub-flavored). Rendered without raw HTML. */
    body: text().notNull(),
    /** Optional link to an original source, e.g. a company engineering blog post. */
    sourceUrl: text(),
    sourceName: text(),
    readingMinutes: integer().notNull().default(1),
    /** Shown first on the landing page and Learn. */
    featured: boolean().notNull().default(false),
    status: articleStatus().notNull().default("draft"),
    authorId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("article_status_published_at_idx").on(t.status, t.publishedAt),
    index("article_topic_id_idx").on(t.topicId),
  ],
);

export const topicRelations = relations(topic, ({ many }) => ({ articles: many(article) }));
export const articleRelations = relations(article, ({ one }) => ({
  topic: one(topic, { fields: [article.topicId], references: [topic.id] }),
}));

export type Article = typeof article.$inferSelect;
export type Topic = typeof topic.$inferSelect;

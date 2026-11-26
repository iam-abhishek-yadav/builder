import { boolean, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { articleStatus } from "./learn";
import { user } from "./users";

/**
 * A learning roadmap. Its structure (stages and steps) is written as a Markdown
 * outline in `outline` and parsed at render time; see lib/roadmaps/outline.ts.
 */
export const roadmap = pgTable(
  "roadmap",
  {
    id: uuid().defaultRandom().primaryKey(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull(),
    outline: text().notNull(),
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
  (t) => [index("roadmap_status_published_at_idx").on(t.status, t.publishedAt)],
);

/** Steps a signed-in user has marked done. `itemKey` is the step's stable key from the outline. */
export const roadmapProgress = pgTable(
  "roadmap_progress",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roadmapId: uuid()
      .notNull()
      .references(() => roadmap.id, { onDelete: "cascade" }),
    itemKey: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roadmapId, t.itemKey] })],
);

export type Roadmap = typeof roadmap.$inferSelect;

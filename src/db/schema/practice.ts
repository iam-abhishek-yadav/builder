import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { articleStatus } from "./learn";
import { user } from "./users";

export type Difficulty = "easy" | "medium" | "hard";

/** One problem in a sheet. `key` is stable (the LeetCode slug) and keys progress across sheets. */
export type SheetProblem = {
  key: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  premium: boolean;
};
export type SheetTopic = { name: string; problems: SheetProblem[] };

/** A curated problem sheet (Blind 75, ...). Managed by admins in Studio. */
export const sheet = pgTable(
  "sheet",
  {
    id: uuid().defaultRandom().primaryKey(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull(),
    /** Problems grouped by topic, in display order. */
    topics: jsonb().$type<SheetTopic[]>().notNull().default([]),
    /** Optional credit/source for the list, e.g. the original curator. */
    sourceName: text(),
    sourceUrl: text(),
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
  (t) => [index("sheet_status_published_at_idx").on(t.status, t.publishedAt)],
);

/**
 * A builder's state for one problem, shared by every sheet containing it.
 * A row exists while the problem is solved and/or starred.
 */
export const problemProgress = pgTable(
  "problem_progress",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    problemKey: text().notNull(),
    solvedAt: timestamp({ withTimezone: true }),
    starred: boolean().notNull().default(false),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.problemKey] })],
);

export type Sheet = typeof sheet.$inferSelect;

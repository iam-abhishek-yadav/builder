import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./users";

export const project = pgTable(
  "project",
  {
    id: uuid().defaultRandom().primaryKey(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    tagline: text().notNull(),
    description: text().notNull(),
    websiteUrl: text().notNull(),
    repoUrl: text(),
    techStack: text().array().notNull().default([]),
    makerId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    launchedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("project_launched_at_idx").on(t.launchedAt),
    index("project_maker_id_idx").on(t.makerId),
  ],
);

export const vote = pgTable(
  "vote",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.projectId] }),
    index("vote_project_id_idx").on(t.projectId),
  ],
);

export const bookmark = pgTable(
  "bookmark",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

export const comment = pgTable(
  "comment",
  {
    id: uuid().defaultRandom().primaryKey(),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("comment_project_id_idx").on(t.projectId, t.createdAt)],
);

export const projectRelations = relations(project, ({ one, many }) => ({
  maker: one(user, { fields: [project.makerId], references: [user.id] }),
  votes: many(vote),
  comments: many(comment),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  project: one(project, { fields: [comment.projectId], references: [project.id] }),
  author: one(user, { fields: [comment.userId], references: [user.id] }),
}));

export const voteRelations = relations(vote, ({ one }) => ({
  project: one(project, { fields: [vote.projectId], references: [project.id] }),
}));

export type Project = typeof project.$inferSelect;

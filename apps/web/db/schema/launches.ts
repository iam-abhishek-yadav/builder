import { relations } from "drizzle-orm";
import {
  date,
  index,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { users } from "./users";

export const launches = pgTable(
  "launches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("launches_user_week_idx").on(table.userId, table.weekStart),
    index("launches_week_start_idx").on(table.weekStart),
  ],
);

export const launchUpvotes = pgTable(
  "launch_upvotes",
  {
    launchId: uuid("launch_id")
      .notNull()
      .references(() => launches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.launchId, table.userId] }),
    index("launch_upvotes_user_id_idx").on(table.userId),
  ],
);

export const launchComments = pgTable(
  "launch_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    launchId: uuid("launch_id")
      .notNull()
      .references(() => launches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (table) => [index("launch_comments_launch_id_idx").on(table.launchId)],
);

export const launchBuyOffers = pgTable(
  "launch_buy_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    launchId: uuid("launch_id")
      .notNull()
      .references(() => launches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("launch_buy_offers_launch_user_idx").on(
      table.launchId,
      table.userId,
    ),
    index("launch_buy_offers_launch_id_idx").on(table.launchId),
  ],
);

export const launchesRelations = relations(launches, ({ one, many }) => ({
  user: one(users, {
    fields: [launches.userId],
    references: [users.id],
  }),
  upvotes: many(launchUpvotes),
  comments: many(launchComments),
  buyOffers: many(launchBuyOffers),
}));

export const launchUpvotesRelations = relations(launchUpvotes, ({ one }) => ({
  launch: one(launches, {
    fields: [launchUpvotes.launchId],
    references: [launches.id],
  }),
  user: one(users, {
    fields: [launchUpvotes.userId],
    references: [users.id],
  }),
}));

export const launchCommentsRelations = relations(launchComments, ({ one }) => ({
  launch: one(launches, {
    fields: [launchComments.launchId],
    references: [launches.id],
  }),
  user: one(users, {
    fields: [launchComments.userId],
    references: [users.id],
  }),
}));

export const launchBuyOffersRelations = relations(
  launchBuyOffers,
  ({ one }) => ({
    launch: one(launches, {
      fields: [launchBuyOffers.launchId],
      references: [launches.id],
    }),
    user: one(users, {
      fields: [launchBuyOffers.userId],
      references: [users.id],
    }),
  }),
);

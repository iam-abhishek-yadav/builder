// Local profile copy of Clerk users. `id` is the Clerk user ID. The row is created
// on the user's first authenticated request so app tables can reference it.
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type ProfileLink = { url: string };
export type WorkType = "full-time" | "contract" | "internship";
export type WorkLocation = "remote" | "hybrid" | "onsite";

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  image: text(),
  /** Username from Clerk / the GitHub account used to sign in. Not the profile handle. */
  username: text(),

  // ---- Public profile ----
  /** Short random id: the profile URL (/u/<publicId>) until a handle is chosen. Never changes. */
  publicId: text().notNull().unique(),
  /** Builder-chosen username for /u/<handle>. Lowercase, unique. Null until chosen. */
  handle: text().unique(),
  headline: text(),
  bio: text(),
  links: jsonb().$type<ProfileLink[]>().notNull().default([]),

  // Open to work (shown only when openToWork is true)
  openToWork: boolean().notNull().default(false),
  workTypes: text().array().$type<WorkType[]>().notNull().default([]),
  workRoles: text(),
  workLocations: text().array().$type<WorkLocation[]>().notNull().default([]),
  workCity: text(),

  /** Opt-in: show roadmap progress and badges on the public profile. */
  showRoadmapProgress: boolean().notNull().default(false),
  /** Opt-in: show DSA sheet progress on the public profile. */
  showPracticeProgress: boolean().notNull().default(false),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

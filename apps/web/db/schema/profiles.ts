import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { type NamedLink, timestamps } from "./common";
import {
  languageProficiencyEnum,
  openToEnum,
  resumeTemplateEnum,
} from "./enums";
import { users } from "./users";

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  experienceYears: integer("experience_years").notNull().default(0),
  experienceMonths: integer("experience_months").notNull().default(0),
  name: text("name"),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  xUrl: text("x_url"),
  skills: text("skills")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  openTo: openToEnum("open_to")
    .array()
    .notNull()
    .default(sql`'{}'::open_to[]`),
  ...timestamps,
});

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    location: text("location"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("experiences_user_id_idx").on(table.userId)],
);

export const educations = pgTable(
  "educations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    school: text("school").notNull(),
    degree: text("degree"),
    field: text("field"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("educations_user_id_idx").on(table.userId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    links: jsonb("links")
      .$type<NamedLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    startDate: date("start_date"),
    endDate: date("end_date"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("projects_user_id_idx").on(table.userId)],
);

export const certifications = pgTable(
  "certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    issuer: text("issuer"),
    issuedAt: date("issued_at"),
    expiresAt: date("expires_at"),
    links: jsonb("links")
      .$type<NamedLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("certifications_user_id_idx").on(table.userId)],
);

export const languages = pgTable(
  "languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    proficiency: languageProficiencyEnum("proficiency").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("languages_user_id_idx").on(table.userId)],
);

export const awards = pgTable(
  "awards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    issuer: text("issuer"),
    awardedAt: date("awarded_at"),
    description: text("description"),
    links: jsonb("links")
      .$type<NamedLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("awards_user_id_idx").on(table.userId)],
);

export const publications = pgTable(
  "publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    venue: text("venue"),
    publishedAt: date("published_at"),
    description: text("description"),
    links: jsonb("links")
      .$type<NamedLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("publications_user_id_idx").on(table.userId)],
);

export const volunteerRoles = pgTable(
  "volunteer_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    description: text("description"),
    links: jsonb("links")
      .$type<NamedLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("volunteer_roles_user_id_idx").on(table.userId)],
);

export const resumes = pgTable("resumes", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  template: resumeTemplateEnum("template").notNull().default("modern"),
  data: jsonb("data")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
  user: one(users, {
    fields: [experiences.userId],
    references: [users.id],
  }),
}));

export const educationsRelations = relations(educations, ({ one }) => ({
  user: one(users, {
    fields: [educations.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
}));

export const languagesRelations = relations(languages, ({ one }) => ({
  user: one(users, {
    fields: [languages.userId],
    references: [users.id],
  }),
}));

export const awardsRelations = relations(awards, ({ one }) => ({
  user: one(users, {
    fields: [awards.userId],
    references: [users.id],
  }),
}));

export const publicationsRelations = relations(publications, ({ one }) => ({
  user: one(users, {
    fields: [publications.userId],
    references: [users.id],
  }),
}));

export const volunteerRolesRelations = relations(volunteerRoles, ({ one }) => ({
  user: one(users, {
    fields: [volunteerRoles.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  resume: one(resumes, {
    fields: [users.id],
    references: [resumes.userId],
  }),
  experiences: many(experiences),
  educations: many(educations),
  projects: many(projects),
  certifications: many(certifications),
  languages: many(languages),
  awards: many(awards),
  publications: many(publications),
  volunteerRoles: many(volunteerRoles),
}));

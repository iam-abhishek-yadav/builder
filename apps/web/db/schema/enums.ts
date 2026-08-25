import { pgEnum } from "drizzle-orm/pg-core";

export const openToEnum = pgEnum("open_to", [
  "internship",
  "full_time",
  "contract",
  "not_looking",
]);

export const languageProficiencyEnum = pgEnum("language_proficiency", [
  "basic",
  "conversational",
  "fluent",
  "native",
]);

export const resumeTemplateEnum = pgEnum("resume_template", [
  "executive",
  "modern",
  "minimal",
]);

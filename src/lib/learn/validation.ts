import { z } from "zod";

const optionalUrl = z
  .union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a valid http(s) URL" })])
  .transform((v) => v || null);

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, "At most 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only");

export const articleSchema = z.object({
  title: z.string().trim().min(5, "At least 5 characters").max(120, "At most 120 characters"),
  slug: slug.or(z.literal("")),
  summary: z.string().trim().min(20, "At least 20 characters").max(300, "At most 300 characters"),
  topicId: z.uuid({ error: "Pick a topic" }),
  tags: z
    .string()
    .transform((v) => [...new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))])
    .pipe(z.array(z.string().max(24, "Each tag must be 24 characters or fewer")).max(8, "Up to 8 tags")),
  body: z.string().trim().min(50, "Write at least a few sentences").max(200_000, "Article is too long"),
  sourceUrl: optionalUrl,
  sourceName: z.string().trim().max(80).transform((v) => v || null),
  featured: z.string().optional().transform((v) => v === "on"),
});

export type ArticleInput = z.input<typeof articleSchema>;

export const topicSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(40, "At most 40 characters"),
  slug: slug.or(z.literal("")),
  description: z.string().trim().max(200, "At most 200 characters"),
  position: z.coerce.number().int().min(0).max(10_000).catch(0),
});

export type TopicInput = z.input<typeof topicSchema>;

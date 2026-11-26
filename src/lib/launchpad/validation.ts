import { z } from "zod";

const httpUrl = z.url({ protocol: /^https?$/, error: "Enter a valid http(s) URL" });

export const launchSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(60, "At most 60 characters"),
  tagline: z.string().trim().min(10, "At least 10 characters").max(80, "At most 80 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Tell people a bit more (20+ characters)")
    .max(2000, "At most 2000 characters"),
  websiteUrl: httpUrl,
  repoUrl: z.union([z.literal(""), httpUrl]).transform((v) => v || null),
  techStack: z
    .string()
    .transform((v) =>
      [...new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))],
    )
    .pipe(
      z
        .array(z.string().max(24, "Each tag must be 24 characters or fewer"))
        .max(8, "Up to 8 tags"),
    ),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment can't be empty").max(1000, "At most 1000 characters"),
});

export type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

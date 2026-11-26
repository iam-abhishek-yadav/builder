import { z } from "zod";
import type { Difficulty, SheetProblem, SheetTopic } from "@/db/schema";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const satisfies readonly Difficulty[];
export const difficultyLabel: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

/**
 * Stable progress key for a problem: the LeetCode slug when the URL is a LeetCode
 * problem (so the same problem in two sheets shares progress), else a slug of the title.
 */
export function problemKey(url: string, title: string) {
  const m = /leetcode\.(?:com|cn)\/problems\/([a-z0-9-]+)/i.exec(url);
  if (m) return `lc:${m[1].toLowerCase()}`;
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `t:${slug || "problem"}`;
}

const problemSchema = z.object({
  title: z.string().trim().min(1, "Problem needs a title").max(150),
  url: z.url({ protocol: /^https?$/, error: "Problem links must be http(s) URLs" }),
  difficulty: z.enum(DIFFICULTIES),
  premium: z.boolean().default(false),
});

/** Validates editor input and assigns keys. Duplicate problems (same key) are rejected. */
export const topicsSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1, "Topic needs a name").max(60),
      problems: z.array(problemSchema).min(1, "Each topic needs at least one problem"),
    }),
  )
  .min(1, "Add at least one topic")
  .transform((topics, ctx): SheetTopic[] => {
    const seen = new Set<string>();
    return topics.map((t) => ({
      name: t.name,
      problems: t.problems.map((p): SheetProblem => {
        const key = problemKey(p.url, p.title);
        if (seen.has(key)) ctx.addIssue({ code: "custom", message: `“${p.title}” appears more than once` });
        seen.add(key);
        return { key, title: p.title, url: p.url, difficulty: p.difficulty, premium: p.premium };
      }),
    }));
  });

export function sheetStats(topics: SheetTopic[]) {
  const problems = topics.flatMap((t) => t.problems);
  const byDifficulty = { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>;
  for (const p of problems) byDifficulty[p.difficulty]++;
  return { total: problems.length, byDifficulty, premium: problems.filter((p) => p.premium).length, keys: problems.map((p) => p.key) };
}

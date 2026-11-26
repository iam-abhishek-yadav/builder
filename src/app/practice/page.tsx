import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/container";
import { getProblemStates, getPublishedSheets } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Practice",
  description: "Curated DSA problem sheets like Blind 75, with progress tracking.",
};

export default function PracticePage() {
  return (
    <Container className="py-12">
      <header className="border-b pb-8">
        <div className="max-w-2xl space-y-2">
          <Eyebrow>Practice</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">DSA sheets</h1>
          <p className="text-muted-foreground">
            Curated problem lists for interview prep. Solve them on LeetCode, tick them off here, and star the ones to
            revisit.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-2xl border bg-muted/50" />}>
        <SheetList />
      </Suspense>
    </Container>
  );
}

async function SheetList() {
  const user = await getCurrentUser();
  const sheets = await getPublishedSheets();
  if (sheets.length === 0) {
    return <div className="mt-8 rounded-xl border border-dashed p-12 text-center text-muted-foreground">The first sheets are on their way.</div>;
  }
  const states = user ? await getProblemStates(user.id) : {};
  return (
    <div className="space-y-4 pt-8">
      {sheets.map((s) => {
        const solved = s.keys.filter((k) => states[k]?.solvedAt).length;
        return (
          <article
            key={s.id}
            className="group relative grid gap-6 rounded-2xl border bg-card p-6 transition-colors hover:border-foreground/25 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-12"
          >
            <div className="flex flex-col">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <span className="text-brand">Sheet</span> · {s.total} problems · {s.topicNames.length} topics
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                <Link href={`/practice/${s.slug}`} className="after:absolute after:inset-0">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">{s.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6 text-sm">
                <span className="inline-flex items-center gap-1 font-medium group-hover:text-brand">
                  Open sheet <ArrowUpRight className="size-4" />
                </span>
                {user ? (
                  <span className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 max-w-40 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${(solved / s.total) * 100}%` }} />
                    </span>
                    <span className="font-mono tabular-nums">
                      {solved}/{s.total} solved
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 text-center text-xs font-medium">
                <span className="flex-1 rounded-lg bg-emerald-600/10 py-2 text-emerald-700 dark:text-emerald-400">
                  Easy <span className="ml-1 font-mono">{s.byDifficulty.easy}</span>
                </span>
                <span className="flex-1 rounded-lg bg-amber-500/15 py-2 text-amber-700 dark:text-amber-400">
                  Medium <span className="ml-1 font-mono">{s.byDifficulty.medium}</span>
                </span>
                <span className="flex-1 rounded-lg bg-rose-600/10 py-2 text-rose-700 dark:text-rose-400">
                  Hard <span className="ml-1 font-mono">{s.byDifficulty.hard}</span>
                </span>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {s.topicNames.map((t) => (
                  <li key={t} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}

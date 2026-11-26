"use client";

import { useClerk } from "@clerk/nextjs";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Check, ExternalLink, Lock, Search, Star } from "lucide-react";
import { useSignedIn } from "@/components/auth/use-signed-in";
import type { Difficulty, SheetTopic } from "@/db/schema";
import { setProblemState } from "@/lib/practice/actions";
import type { ProblemState } from "@/lib/practice/queries";
import { difficultyLabel } from "@/lib/practice/sheet";
import { cn } from "@/lib/utils";

type Props = {
  topics: SheetTopic[];
  states: Record<string, ProblemState>;
  serverSignedIn: boolean;
};

type Status = "all" | "unsolved" | "solved" | "starred";
type Change = { key: string; solved?: boolean; starred?: boolean };

const difficultyClass: Record<Difficulty, string> = {
  easy: "text-emerald-700 bg-emerald-600/10 dark:text-emerald-400",
  medium: "text-amber-700 bg-amber-500/15 dark:text-amber-400",
  hard: "text-rose-700 bg-rose-600/10 dark:text-rose-400",
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(iso: string) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  return Math.abs(months) < 12 ? rtf.format(months, "month") : rtf.format(Math.round(days / 365), "year");
}

export function SheetView({ topics, states, serverSignedIn }: Props) {
  const signedIn = useSignedIn(serverSignedIn);
  const clerk = useClerk();
  const [, startTransition] = useTransition();
  const [optimistic, apply] = useOptimistic(states, (s, c: Change) => {
    const cur = s[c.key] ?? { solvedAt: null, starred: false };
    return {
      ...s,
      [c.key]: {
        solvedAt: c.solved === undefined ? cur.solvedAt : c.solved ? (cur.solvedAt ?? new Date().toISOString()) : null,
        starred: c.starred ?? cur.starred,
      },
    };
  });

  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [hidePremium, setHidePremium] = useState(false);

  const all = useMemo(() => topics.flatMap((t) => t.problems), [topics]);
  const solvedCount = (list: typeof all) => list.filter((p) => optimistic[p.key]?.solvedAt).length;

  function change(c: Change) {
    if (!signedIn) {
      clerk.openSignIn();
      return;
    }
    startTransition(async () => {
      apply(c);
      await setProblemState(c.key, { solved: c.solved, starred: c.starred });
    });
  }

  const q = query.trim().toLowerCase();
  const visible = (p: (typeof all)[number]) => {
    const st = optimistic[p.key];
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (hidePremium && p.premium) return false;
    if (status === "solved" && !st?.solvedAt) return false;
    if (status === "unsolved" && st?.solvedAt) return false;
    if (status === "starred" && !st?.starred) return false;
    return true;
  };
  const shownTopics = topics.map((t) => ({ ...t, shown: t.problems.filter(visible) })).filter((t) => t.shown.length > 0);
  const filtering = q || difficulty !== "all" || status !== "all" || hidePremium;

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{signedIn ? solvedCount(all) : 0}</span>
            <span className="text-muted-foreground">/ {all.length} solved</span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={signedIn ? solvedCount(all) : 0}
            aria-valuemin={0}
            aria-valuemax={all.length}
            aria-label="Problems solved"
          >
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${signedIn ? (solvedCount(all) / all.length) * 100 : 0}%` }} />
          </div>
          {!signedIn ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <button type="button" onClick={() => clerk.openSignIn()} className="font-medium text-foreground underline underline-offset-4">
                Sign in
              </button>{" "}
              to track solved problems and stars.
            </p>
          ) : null}
        </div>
        <dl className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => {
            const list = all.filter((p) => p.difficulty === d);
            return (
              <div key={d} className={cn("min-w-20 rounded-xl px-3 py-2 text-center", difficultyClass[d])}>
                <dt className="text-xs font-medium">{difficultyLabel[d]}</dt>
                <dd className="font-mono text-sm tabular-nums">
                  {signedIn ? solvedCount(list) : 0}/{list.length}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-48 flex-1 sm:max-w-xs">
          <span className="sr-only">Search problems</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems"
            className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <Segmented
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={[["all", "All"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]}
        />
        <Segmented
          label="Status"
          value={status}
          onChange={setStatus}
          options={[["all", "All"], ["unsolved", "Unsolved"], ["solved", "Solved"], ["starred", "Starred"]]}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={hidePremium} onChange={(e) => setHidePremium(e.target.checked)} className="size-4 accent-brand" />
          Hide Premium
        </label>
      </div>

      {/* Topics */}
      {shownTopics.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No problems match these filters.</div>
      ) : (
        shownTopics.map((topic) => (
          <section key={topic.name} aria-labelledby={`topic-${topic.name}`} className="overflow-hidden rounded-2xl border">
            <header className="flex items-center justify-between gap-4 border-b bg-muted/40 px-4 py-3">
              <h2 id={`topic-${topic.name}`} className="font-semibold">
                {topic.name}
              </h2>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {filtering ? `${topic.shown.length} shown · ` : ""}
                {signedIn ? solvedCount(topic.problems) : 0}/{topic.problems.length}
              </span>
            </header>
            <ul className="divide-y">
              {topic.shown.map((p) => {
                const st = optimistic[p.key];
                const solved = signedIn && Boolean(st?.solvedAt);
                const starred = signedIn && Boolean(st?.starred);
                return (
                  <li key={p.key} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", solved && "bg-muted/30")}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={solved}
                      aria-label={`Mark ${p.title} ${solved ? "unsolved" : "solved"}`}
                      onClick={() => change({ key: p.key, solved: !solved })}
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                        solved ? "border-brand bg-brand text-brand-foreground" : "hover:border-foreground/50",
                      )}
                    >
                      {solved ? <Check className="size-3.5" /> : null}
                    </button>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn("group min-w-0 flex-1 font-medium hover:text-brand sm:truncate", solved && "text-muted-foreground")}
                    >
                      {p.title}
                      <ExternalLink className="ml-1.5 inline size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                    </a>
                    {p.premium ? (
                      <span title="LeetCode Premium" className="shrink-0 text-muted-foreground">
                        <Lock className="size-3.5" />
                        <span className="sr-only">Premium</span>
                      </span>
                    ) : null}
                    {solved && st?.solvedAt ? (
                      <span className="hidden shrink-0 text-xs text-muted-foreground md:inline" suppressHydrationWarning>
                        solved {ago(st.solvedAt)}
                      </span>
                    ) : null}
                    <span className={cn("w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium", difficultyClass[p.difficulty])}>
                      {difficultyLabel[p.difficulty]}
                    </span>
                    <button
                      type="button"
                      aria-pressed={starred}
                      aria-label={`${starred ? "Unstar" : "Star"} ${p.title} to revisit`}
                      onClick={() => change({ key: p.key, starred: !starred })}
                      className={cn("shrink-0 rounded p-1 transition-colors", starred ? "text-amber-500" : "text-muted-foreground/50 hover:text-foreground")}
                    >
                      <Star className={cn("size-4", starred && "fill-current")} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex rounded-lg border p-0.5 text-xs" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn("rounded-md px-2.5 py-1", value === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

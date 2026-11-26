"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useOptimistic, useState, useTransition } from "react";
import { BookOpen, Check, ExternalLink } from "lucide-react";
import { useSignedIn } from "@/components/auth/use-signed-in";
import { Button } from "@/components/ui/button";
import { setStepDone } from "@/lib/roadmaps/actions";
import type { RoadmapStage, RoadmapStep, StepKind } from "@/lib/roadmaps/outline";
import { cn } from "@/lib/utils";

type Props = {
  stages: RoadmapStage[];
  /** Linked Learn articles: slug -> title (published only). */
  articles: Record<string, string>;
  /** Null in Studio preview: progress tracking is disabled. */
  roadmapId: string | null;
  doneKeys?: string[];
  serverSignedIn?: boolean;
};

const kindLabel: Record<StepKind, string> = { core: "Core", optional: "Optional", alt: "Alternative" };

export function RoadmapView({ stages, articles, roadmapId, doneKeys = [], serverSignedIn = false }: Props) {
  const signedIn = useSignedIn(serverSignedIn);
  const [done, applyDone] = useOptimistic(new Set(doneKeys), (set, change: { key: string; done: boolean }) => {
    const next = new Set(set);
    if (change.done) next.add(change.key);
    else next.delete(change.key);
    return next;
  });
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState<string | null>(null);

  const allSteps = stages.flatMap((s) => s.steps);
  const coreSteps = allSteps.filter((s) => s.kind === "core");
  const doneCore = coreSteps.filter((s) => done.has(s.key)).length;
  const tracking = roadmapId !== null;

  function toggle(step: RoadmapStep) {
    if (!roadmapId) return;
    const next = !done.has(step.key);
    startTransition(async () => {
      applyDone({ key: step.key, done: next });
      await setStepDone(roadmapId, step.key, next);
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
        <Legend />
        {tracking ? (
          signedIn ? (
            <ProgressBar
              done={doneCore}
              total={coreSteps.length}
              extra={allSteps.length - coreSteps.length}
              // Count only steps still in the outline (renamed steps leave stale keys behind).
              doneAll={allSteps.filter((s) => done.has(s.key)).length}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              <SignInButton mode="modal">
                <button type="button" className="font-medium text-foreground underline underline-offset-4">
                  Sign in
                </button>
              </SignInButton>{" "}
              to track your progress.
            </p>
          )
        ) : (
          <p className="font-mono text-xs text-muted-foreground">PREVIEW · progress tracking is off</p>
        )}
      </div>

      <ol className="relative space-y-12 border-l pl-8 sm:pl-10">
        {stages.map((stage, i) => {
          const openStep = stage.steps.find((s) => s.key === open) ?? null;
          const stageDone = stage.steps.filter((s) => s.kind === "core").every((s) => done.has(s.key));
          return (
            <li key={stage.key} className="relative">
              <span
                className={cn(
                  "absolute top-0 -left-11.25 grid size-6.5 place-items-center rounded-full border bg-background font-mono text-xs sm:-left-13.25",
                  tracking && signedIn && stageDone && "border-brand bg-brand text-brand-foreground",
                )}
                aria-hidden
              >
                {tracking && signedIn && stageDone ? <Check className="size-3.5" /> : i + 1}
              </span>
              <h2 id={stage.key} className="scroll-mt-28 text-xl font-semibold tracking-tight">
                {stage.title}
              </h2>
              {stage.description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{stage.description}</p> : null}

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {stage.steps.map((step) => (
                  <StepButton
                    key={step.key}
                    step={step}
                    done={tracking && signedIn && done.has(step.key)}
                    open={open === step.key}
                    onClick={() => setOpen(open === step.key ? null : step.key)}
                  />
                ))}
              </div>

              {openStep ? (
                <StepDetails
                  step={openStep}
                  articles={articles}
                  tracking={tracking}
                  signedIn={signedIn}
                  done={done.has(openStep.key)}
                  onToggle={() => toggle(openStep)}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepButton({ step, done, open, onClick }: { step: RoadmapStep; done: boolean; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={`step-${step.key}`}
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
        step.kind === "core" ? "bg-background" : "border-dashed bg-muted/30",
        open ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/40",
        done && "border-brand/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
          done ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40",
        )}
        aria-hidden
      >
        {done ? <Check className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-medium", done && "text-muted-foreground line-through decoration-brand/60")}>
          {step.title}
        </span>
        {step.summary ? <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{step.summary}</span> : null}
      </span>
      {step.kind !== "core" ? (
        <span className="shrink-0 rounded-full border px-1.5 font-mono text-[10px] leading-4 tracking-wide text-muted-foreground uppercase">
          {step.kind === "optional" ? "Opt" : "Alt"}
        </span>
      ) : null}
      {done ? <span className="sr-only">(done)</span> : null}
    </button>
  );
}

function StepDetails({
  step,
  articles,
  tracking,
  signedIn,
  done,
  onToggle,
}: {
  step: RoadmapStep;
  articles: Record<string, string>;
  tracking: boolean;
  signedIn: boolean;
  done: boolean;
  onToggle: () => void;
}) {
  const linked = step.articleSlugs.filter((s) => articles[s]);
  return (
    <div id={`step-${step.key}`} className="mt-3 animate-in rounded-xl border bg-muted/30 p-5 fade-in slide-in-from-top-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-brand uppercase">{kindLabel[step.kind]}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{step.title}</h3>
        </div>
        {tracking ? (
          signedIn ? (
            <Button variant={done ? "outline" : "default"} size="sm" onClick={onToggle} aria-pressed={done}>
              <Check /> {done ? "Done" : "Mark as done"}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in to track
              </Button>
            </SignInButton>
          )
        ) : null}
      </div>
      {step.summary ? <p className="mt-3 text-sm">{step.summary}</p> : null}
      {step.details.length ? (
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {step.details.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
      ) : null}
      {linked.length || step.resources.length ? (
        <ul className="mt-4 space-y-1.5 text-sm">
          {linked.map((slug) => (
            <li key={slug}>
              <Link href={`/learn/${slug}`} className="inline-flex items-center gap-2 font-medium hover:text-brand">
                <BookOpen className="size-4 text-brand" /> {articles[slug]}
              </Link>
            </li>
          ))}
          {step.resources.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 hover:text-brand">
                <ExternalLink className="size-4 text-muted-foreground" /> {r.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded border bg-background" /> Core
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded border border-dashed bg-muted/50" /> Optional / alternative
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-full border-brand bg-brand" /> Done
      </span>
    </div>
  );
}

function ProgressBar({ done, total, extra, doneAll }: { done: number; total: number; extra: number; doneAll: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex min-w-60 items-center gap-3">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Core steps completed"
      >
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums">
        {done}/{total} core · {pct}%
        {extra > 0 && doneAll > done ? ` · +${doneAll - done} extra` : ""}
      </span>
    </div>
  );
}

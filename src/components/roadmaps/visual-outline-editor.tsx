"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DraftStage, DraftStep, RoadmapStage, StepKind } from "@/lib/roadmaps/outline";
import { cn } from "@/lib/utils";

// Visual editing of a roadmap outline. Items carry local ids so inputs keep focus
// while titles change (step keys are derived from titles and would churn).

export type VStep = DraftStep & { id: string };
export type VStage = Omit<DraftStage, "steps"> & { id: string; steps: VStep[] };

// Local React keys only (never rendered or saved), so a simple counter is enough.
let counter = 0;
const uid = () => `v${++counter}`;

export function toVisual(stages: RoadmapStage[]): VStage[] {
  return stages.map((s) => ({
    id: uid(),
    title: s.title,
    description: s.description,
    steps: s.steps.map((st) => ({
      id: uid(),
      title: st.title,
      kind: st.kind,
      summary: st.summary,
      details: st.details,
      resources: st.resources,
      articleSlugs: st.articleSlugs,
    })),
  }));
}

const newStep = (): VStep => ({ id: uid(), title: "", kind: "core", summary: "", details: [], resources: [], articleSlugs: [] });
const newStage = (): VStage => ({ id: uid(), title: "", description: "", steps: [newStep()] });

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function VisualOutlineEditor({
  stages,
  onChange,
  articles,
}: {
  stages: VStage[];
  onChange: (stages: VStage[]) => void;
  /** Published Learn articles: slug -> title. */
  articles: Record<string, string>;
}) {
  const [openStep, setOpenStep] = useState<string | null>(null);

  const updateStage = (i: number, patch: Partial<VStage>) =>
    onChange(stages.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updateStep = (si: number, ti: number, patch: Partial<VStep>) =>
    updateStage(si, { steps: stages[si].steps.map((t, j) => (j === ti ? { ...t, ...patch } : t)) });

  return (
    <div className="space-y-4">
      {stages.map((stage, si) => (
        <section key={stage.id} className="rounded-xl border bg-background" aria-label={`Stage ${si + 1}`}>
          <div className="flex items-start gap-2 border-b p-3">
            <span className="mt-1.5 grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs">{si + 1}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={stage.title}
                onChange={(e) => updateStage(si, { title: e.target.value })}
                placeholder="Stage title"
                aria-label="Stage title"
                className="font-semibold"
              />
              <Textarea
                value={stage.description}
                onChange={(e) => updateStage(si, { description: e.target.value })}
                placeholder="What this stage is about (optional)"
                aria-label="Stage description"
                rows={2}
                className="text-sm"
              />
            </div>
            <ItemControls
              label="stage"
              onUp={si > 0 ? () => onChange(move(stages, si, si - 1)) : undefined}
              onDown={si < stages.length - 1 ? () => onChange(move(stages, si, si + 1)) : undefined}
              onDelete={() => {
                if (stage.steps.some((s) => s.title) && !confirm(`Delete the stage “${stage.title || "Untitled"}” and its steps?`)) return;
                onChange(stages.filter((_, j) => j !== si));
              }}
            />
          </div>

          <ol className="divide-y">
            {stage.steps.map((step, ti) => {
              const open = openStep === step.id;
              return (
                <li key={step.id} className={cn("p-3", step.kind !== "core" && "bg-muted/30")}>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenStep(open ? null : step.id)}
                      aria-expanded={open}
                      aria-label={open ? "Hide step details" : "Show step details"}
                      className="mt-1.5 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]">
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(si, ti, { title: e.target.value })}
                        placeholder="Step title"
                        aria-label="Step title"
                      />
                      <Input
                        value={step.summary}
                        onChange={(e) => updateStep(si, ti, { summary: e.target.value })}
                        placeholder="One-line summary"
                        aria-label="Step summary"
                      />
                      <select
                        value={step.kind}
                        onChange={(e) => updateStep(si, ti, { kind: e.target.value as StepKind })}
                        aria-label="Step type"
                        className={selectClass}
                      >
                        <option value="core">Core</option>
                        <option value="optional">Optional</option>
                        <option value="alt">Alternative</option>
                      </select>
                    </div>
                    <ItemControls
                      label="step"
                      onUp={ti > 0 ? () => updateStage(si, { steps: move(stage.steps, ti, ti - 1) }) : undefined}
                      onDown={ti < stage.steps.length - 1 ? () => updateStage(si, { steps: move(stage.steps, ti, ti + 1) }) : undefined}
                      onDelete={() => updateStage(si, { steps: stage.steps.filter((_, j) => j !== ti) })}
                    />
                  </div>
                  {!open && (step.resources.length || step.articleSlugs.length || step.details.length) ? (
                    <p className="mt-1 ml-7 font-mono text-[11px] text-muted-foreground">
                      {[
                        step.resources.length && `${step.resources.length} resource${step.resources.length === 1 ? "" : "s"}`,
                        step.articleSlugs.length && `${step.articleSlugs.length} article${step.articleSlugs.length === 1 ? "" : "s"}`,
                        step.details.length && "details",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {open ? <StepExtras step={step} articles={articles} onChange={(patch) => updateStep(si, ti, patch)} /> : null}
                </li>
              );
            })}
          </ol>
          <div className="p-3 pt-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const step = newStep();
                updateStage(si, { steps: [...stage.steps, step] });
                setOpenStep(null);
              }}
            >
              <Plus /> Add step
            </Button>
          </div>
        </section>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...stages, newStage()])}>
        <Plus /> Add stage
      </Button>
    </div>
  );
}

function ItemControls({ label, onUp, onDown, onDelete }: { label: string; onUp?: () => void; onDown?: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 items-center">
      <Button type="button" variant="ghost" size="icon-sm" onClick={onUp} disabled={!onUp} aria-label={`Move ${label} up`}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDown} disabled={!onDown} aria-label={`Move ${label} down`}>
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${label}`}>
        <Trash2 />
      </Button>
    </div>
  );
}

function StepExtras({
  step,
  articles,
  onChange,
}: {
  step: VStep;
  articles: Record<string, string>;
  onChange: (patch: Partial<VStep>) => void;
}) {
  const available = Object.entries(articles).filter(([slug]) => !step.articleSlugs.includes(slug));
  return (
    <div className="mt-3 ml-7 space-y-4 rounded-lg border bg-background p-3">
      <div className="space-y-1.5">
        <p className="text-xs font-medium">Details</p>
        <Textarea
          value={step.details.join("\n")}
          onChange={(e) => onChange({ details: e.target.value.split("\n") })}
          onBlur={(e) => onChange({ details: e.target.value.split("\n").map((d) => d.trim()).filter(Boolean) })}
          placeholder="Shown when a reader opens the step. One paragraph per line."
          aria-label="Step details"
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium">Resources</p>
        {step.resources.map((r, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={r.label}
              onChange={(e) => onChange({ resources: step.resources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              placeholder="Label"
              aria-label="Resource label"
              className="w-1/3"
            />
            <Input
              value={r.url}
              type="url"
              onChange={(e) => onChange({ resources: step.resources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
              placeholder="https://"
              aria-label="Resource URL"
              aria-invalid={r.url && !/^https?:\/\/\S+$/.test(r.url) ? true : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove resource"
              onClick={() => onChange({ resources: step.resources.filter((_, j) => j !== i) })}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="xs" onClick={() => onChange({ resources: [...step.resources, { label: "", url: "" }] })}>
          <Plus /> Add resource
        </Button>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium">Learn articles</p>
        <div className="flex flex-wrap gap-1.5">
          {step.articleSlugs.map((slug) => (
            <span key={slug} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
              {articles[slug] ?? <span className="text-destructive">{slug} (not published)</span>}
              <button
                type="button"
                aria-label="Remove article link"
                onClick={() => onChange({ articleSlugs: step.articleSlugs.filter((s) => s !== slug) })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        {available.length ? (
          <select
            value=""
            onChange={(e) => e.target.value && onChange({ articleSlugs: [...step.articleSlugs, e.target.value] })}
            aria-label="Link a Learn article"
            className={cn(selectClass, "w-full")}
          >
            <option value="">Link a published article…</option>
            {available.map(([slug, title]) => (
              <option key={slug} value={slug}>
                {title}
              </option>
            ))}
          </select>
        ) : step.articleSlugs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No published articles to link yet.</p>
        ) : null}
      </div>
    </div>
  );
}

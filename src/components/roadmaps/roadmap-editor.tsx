"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { RoadmapView } from "@/components/roadmaps/roadmap-view";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteRoadmap, saveRoadmap, type RoadmapFormState } from "@/lib/roadmaps/actions";
import { parseOutline, serializeOutline } from "@/lib/roadmaps/outline";
import { toVisual, VisualOutlineEditor, type VStage } from "./visual-outline-editor";
import { cn } from "@/lib/utils";

export type EditableRoadmap = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  outline: string;
  featured: string;
  status: "draft" | "published";
};

const STARTER = `## Foundations
What to be comfortable with before anything else.

- First core step :: one-line description shown on the card
  - [A resource](https://example.com)
  - learn: your-article-slug
  - Extra detail shown when the step is opened.
- (optional) A nice-to-have step
- (alt) An alternative to the step above

## Next stage
- Another step
`;

const HELP = [
  ["## Stage", "starts a stage (its plain lines become the description)"],
  ["- Step :: summary", "a core step"],
  ["- (optional) Step", "optional step"],
  ["- (alt) Step", "alternative step"],
  ["  - [Label](https://…)", "resource link"],
  ["  - learn: article-slug", "link a published Learn article"],
  ["  - any text", "detail shown when opened"],
] as const;

export function RoadmapEditor({
  roadmap,
  articles,
  justCreated = false,
}: {
  roadmap: EditableRoadmap | null;
  /** Published Learn articles: slug -> title, for previewing `learn:` links. */
  articles: Record<string, string>;
  justCreated?: boolean;
}) {
  const [state, action, pending] = useActionState<RoadmapFormState, FormData>(
    saveRoadmap.bind(null, roadmap?.id ?? null),
    justCreated ? { ok: true, message: "Draft created." } : {},
  );
  const v = state.values ?? roadmap ?? null;
  const errors = state.fieldErrors ?? {};
  const status = state.status ?? roadmap?.status ?? "draft";
  const slug = state.slug ?? roadmap?.slug;

  const [outline, setOutline] = useState(roadmap?.outline ?? STARTER);
  const deferred = useDeferredValue(outline);
  const parsed = useMemo(() => parseOutline(deferred), [deferred]);
  const unknownLinks = useMemo(
    () => [...new Set(parsed.stages.flatMap((s) => s.steps.flatMap((st) => st.articleSlugs)))].filter((s) => !articles[s]),
    [parsed, articles],
  );
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [mode, setMode] = useState<"visual" | "outline">("visual");
  // Visual model; the outline text stays the single source of truth that gets saved.
  const [visual, setVisual] = useState<VStage[]>(() => toVisual(parseOutline(roadmap?.outline ?? STARTER).stages));
  const [dirty, setDirty] = useState(false);

  function changeVisual(next: VStage[]) {
    setVisual(next);
    setOutline(serializeOutline(next));
    setDirty(true);
  }
  function switchMode(next: "visual" | "outline") {
    if (next === mode) return;
    // Re-read the (possibly hand-edited) outline when returning to the visual view.
    if (next === "visual") setVisual(toVisual(parseOutline(outline).stages));
    setMode(next);
  }
  const formRef = useRef<HTMLFormElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);

  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.ok) setDirty(false);
  }

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit(saveButton.current ?? undefined);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const err = (name: keyof typeof errors) =>
    errors[name]?.length ? (
      <ul className="space-y-0.5 text-xs text-destructive">
        {errors[name]!.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <form ref={formRef} action={action} onChange={() => setDirty(true)} className="flex flex-1 flex-col">
        <div className="sticky top-[5.75rem] sm:top-14 z-30 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
            <Link href="/studio/roadmaps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Roadmaps
            </Link>
            <Badge variant={status === "published" ? "default" : "outline"}>{status === "published" ? "Published" : "Draft"}</Badge>
            <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {pending ? "Saving…" : dirty ? "Unsaved changes" : (state.message ?? "")}
              {state.error && !pending ? <span className="text-destructive">{state.error}</span> : null}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {status === "published" && slug ? (
                <Link href={`/roadmaps/${slug}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  View <ExternalLink />
                </Link>
              ) : null}
              {status === "published" ? (
                <Button type="submit" name="intent" value="unpublish" variant="outline" size="sm" disabled={pending}>
                  Unpublish
                </Button>
              ) : null}
              <Button ref={saveButton} type="submit" name="intent" value="draft" variant="outline" size="sm" disabled={pending}>
                {status === "published" ? "Save" : "Save draft"}
              </Button>
              <Button type="submit" name="intent" value="publish" size="sm" disabled={pending || parsed.errors.length > 0}>
                {status === "published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title" className="sr-only">
                Title
              </Label>
              <input
                id="title"
                name="title"
                defaultValue={v?.title}
                required
                maxLength={100}
                placeholder="Roadmap title"
                className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
              />
              {err("title")}
            </div>
            <div className="space-y-1">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" defaultValue={v?.summary} required rows={2} maxLength={300} placeholder="Who this is for and where it takes them." />
              {err("summary")}
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div className="w-72 space-y-1">
                <Label htmlFor="slug">URL slug</Label>
                <Input id="slug" name="slug" defaultValue={v?.slug} placeholder="from title if empty" className="font-mono" />
                {err("slug")}
              </div>
              <label className="flex cursor-pointer items-center gap-2 pb-1.5 text-sm">
                <input type="checkbox" name="featured" defaultChecked={v?.featured === "on"} className="size-4 accent-brand" />
                Feature on the landing page
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-1 lg:hidden" role="tablist">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("rounded-md px-3 py-1.5 text-sm capitalize", tab === t ? "bg-muted font-medium" : "text-muted-foreground")}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-6 lg:mt-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className={cn("flex flex-col gap-3", tab !== "write" && "hidden lg:flex")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1 rounded-lg border p-0.5 text-xs" role="tablist" aria-label="Editing mode">
                  {(["visual", "outline"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={cn(
                        "rounded-md px-2.5 py-1 capitalize",
                        mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {parsed.stages.length} stages · {parsed.stepCount} steps
                </span>
              </div>
              {mode === "visual" ? (
                <>
                  <VisualOutlineEditor stages={visual} onChange={changeVisual} articles={articles} />
                  <input type="hidden" name="outline" value={outline} />
                </>
              ) : (
                <textarea
                  id="outline"
                  name="outline"
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  spellCheck
                  aria-label="Roadmap outline"
                  aria-invalid={parsed.errors.length ? true : undefined}
                  className="min-h-[55vh] flex-1 resize-y rounded-xl border bg-muted/20 p-4 font-mono text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              )}
              {parsed.errors.length || unknownLinks.length ? (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
                  {parsed.errors.map((e) => (
                    <p key={e} className="flex gap-1.5 text-destructive">
                      <AlertTriangle className="size-3.5 shrink-0" /> {e}
                    </p>
                  ))}
                  {unknownLinks.map((s) => (
                    <p key={s} className="flex gap-1.5 text-muted-foreground">
                      <AlertTriangle className="size-3.5 shrink-0" /> learn: {s} is not a published article, so it will be hidden.
                    </p>
                  ))}
                </div>
              ) : null}
              <details className={cn("rounded-lg border p-3 text-xs", mode === "visual" && "hidden")}>
                <summary className="cursor-pointer font-medium">Outline syntax</summary>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  {HELP.map(([code, what]) => (
                    <div key={code} className="contents">
                      <dt className="font-mono whitespace-pre">{code}</dt>
                      <dd className="text-muted-foreground">{what}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-muted-foreground">Renaming a stage or step resets readers&apos; progress on that step.</p>
              </details>
            </div>
            <div className={cn("min-w-0 rounded-xl border p-6", tab !== "preview" && "hidden lg:block")}>
              <p className="mb-4 font-mono text-xs text-muted-foreground">PREVIEW</p>
              <RoadmapView stages={parsed.stages} articles={articles} roadmapId={null} />
            </div>
          </div>
        </div>
      </form>

      {roadmap ? (
        <form
          action={deleteRoadmap.bind(null, roadmap.id)}
          onSubmit={(e) => {
            if (!confirm("Delete this roadmap permanently? Readers' progress on it is deleted too.")) e.preventDefault();
          }}
          className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6"
        >
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 /> Delete roadmap
          </Button>
        </form>
      ) : null}
    </div>
  );
}

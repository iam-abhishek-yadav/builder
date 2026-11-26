"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Difficulty } from "@/db/schema";
import { deleteSheet, importLeetCodeList, saveSheet, type SheetFormState } from "@/lib/practice/actions";
import { cn } from "@/lib/utils";

type EProblem = { id: string; title: string; url: string; difficulty: Difficulty; premium: boolean };
type ETopic = { id: string; name: string; problems: EProblem[] };

export type EditableSheet = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  featured: boolean;
  status: "draft" | "published";
  topics: { name: string; problems: { title: string; url: string; difficulty: Difficulty; premium: boolean }[] }[];
};

// Local React keys only (never saved).
let counter = 0;
const uid = () => `s${++counter}`;
const blankProblem = (): EProblem => ({ id: uid(), title: "", url: "", difficulty: "medium", premium: false });

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function SheetEditor({ sheet, justCreated = false }: { sheet: EditableSheet | null; justCreated?: boolean }) {
  const [state, action, pending] = useActionState<SheetFormState, FormData>(
    saveSheet.bind(null, sheet?.id ?? null),
    justCreated ? { ok: true, message: "Draft created." } : {},
  );
  const errors = state.fieldErrors ?? {};
  const status = state.status ?? sheet?.status ?? "draft";
  const slug = state.slug ?? sheet?.slug;

  const [topics, setTopics] = useState<ETopic[]>(() =>
    sheet?.topics.length
      ? sheet.topics.map((t) => ({ id: uid(), name: t.name, problems: t.problems.map((p) => ({ id: uid(), ...p })) }))
      : [{ id: uid(), name: "Arrays", problems: [blankProblem()] }],
  );
  const [dirty, setDirty] = useState(false);
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

  function update(next: ETopic[]) {
    setTopics(next);
    setDirty(true);
  }
  const setTopic = (ti: number, patch: Partial<ETopic>) => update(topics.map((t, i) => (i === ti ? { ...t, ...patch } : t)));
  const setProblem = (ti: number, pi: number, patch: Partial<EProblem>) =>
    setTopic(ti, { problems: topics[ti].problems.map((p, i) => (i === pi ? { ...p, ...patch } : p)) });
  function moveProblemToTopic(ti: number, pi: number, toTopic: number) {
    const problem = topics[ti].problems[pi];
    update(
      topics.map((t, i) =>
        i === ti ? { ...t, problems: t.problems.filter((_, j) => j !== pi) } : i === toTopic ? { ...t, problems: [...t.problems, problem] } : t,
      ),
    );
  }

  const serialized = JSON.stringify(
    topics.map((t) => ({ name: t.name, problems: t.problems.map(({ title, url, difficulty, premium }) => ({ title, url, difficulty, premium })) })),
  );
  const total = topics.reduce((n, t) => n + t.problems.length, 0);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <form ref={formRef} action={action} onChange={() => setDirty(true)} className="flex flex-1 flex-col">
        <input type="hidden" name="topics" value={serialized} />
        <div className="sticky top-[5.75rem] z-30 border-b bg-background/95 backdrop-blur sm:top-14">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
            <Link href="/studio/sheets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Sheets
            </Link>
            <Badge variant={status === "published" ? "default" : "outline"}>{status === "published" ? "Published" : "Draft"}</Badge>
            <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {pending ? "Saving…" : dirty ? "Unsaved changes" : (state.message ?? "")}
              {state.error && !pending ? <span className="text-destructive">{state.error}</span> : null}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {status === "published" && slug ? (
                <Link href={`/practice/${slug}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })}>
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
              <Button type="submit" name="intent" value="publish" size="sm" disabled={pending}>
                {status === "published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-6 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title" className="sr-only">
                Title
              </Label>
              <input
                id="title"
                name="title"
                defaultValue={sheet?.title}
                required
                maxLength={100}
                placeholder="Sheet title"
                className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
              />
              {errors.title ? <p className="text-xs text-destructive">{errors.title[0]}</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" defaultValue={sheet?.summary} required rows={2} maxLength={300} placeholder="Who it's for and what it covers." />
              {errors.summary ? <p className="text-xs text-destructive">{errors.summary[0]}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="slug">URL slug</Label>
                <Input id="slug" name="slug" defaultValue={sheet?.slug} placeholder="from title if empty" className="font-mono" />
                {errors.slug ? <p className="text-xs text-destructive">{errors.slug[0]}</p> : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sourceName">List credit (optional)</Label>
                <Input id="sourceName" name="sourceName" defaultValue={sheet?.sourceName} placeholder="LeetCode" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sourceUrl">Credit URL</Label>
                <Input id="sourceUrl" name="sourceUrl" type="url" defaultValue={sheet?.sourceUrl} placeholder="https://" />
                {errors.sourceUrl ? <p className="text-xs text-destructive">{errors.sourceUrl[0]}</p> : null}
              </div>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={sheet?.featured} className="size-4 accent-brand" />
              Feature on the landing page
            </label>
          </div>

          <ImportBox
            onImport={(problems) => {
              update([...topics, { id: uid(), name: "Imported", problems: problems.map((p) => ({ id: uid(), ...p })) }]);
            }}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Problems</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {topics.length} topics · {total} problems
              </span>
            </div>
            {errors.topics ? (
              <ul className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {errors.topics.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {topics.map((topic, ti) => (
            <section key={topic.id} className="rounded-xl border" aria-label={`Topic ${ti + 1}`}>
              <div className="flex items-center gap-2 border-b bg-muted/40 p-3">
                <Input
                  value={topic.name}
                  onChange={(e) => setTopic(ti, { name: e.target.value })}
                  placeholder="Topic name"
                  aria-label="Topic name"
                  className="max-w-xs font-semibold"
                />
                <span className="font-mono text-xs text-muted-foreground">{topic.problems.length}</span>
                <div className="ml-auto flex">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={ti === 0} onClick={() => update(move(topics, ti, ti - 1))} aria-label="Move topic up">
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={ti === topics.length - 1}
                    onClick={() => update(move(topics, ti, ti + 1))}
                    aria-label="Move topic down"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete topic"
                    onClick={() => {
                      if (topic.problems.some((p) => p.title) && !confirm(`Delete “${topic.name || "Untitled"}” and its problems?`)) return;
                      update(topics.filter((_, i) => i !== ti));
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <ol className="divide-y">
                {topic.problems.map((p, pi) => (
                  <li key={p.id} className="grid gap-2 p-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_auto_auto_auto_auto] lg:items-center">
                    <Input value={p.title} onChange={(e) => setProblem(ti, pi, { title: e.target.value })} placeholder="Problem title" aria-label="Problem title" />
                    <Input value={p.url} type="url" onChange={(e) => setProblem(ti, pi, { url: e.target.value })} placeholder="https://leetcode.com/problems/…" aria-label="Problem URL" className="font-mono text-xs" />
                    <select value={p.difficulty} onChange={(e) => setProblem(ti, pi, { difficulty: e.target.value as Difficulty })} aria-label="Difficulty" className={selectClass}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
                      <input type="checkbox" checked={p.premium} onChange={(e) => setProblem(ti, pi, { premium: e.target.checked })} className="size-4 accent-brand" />
                      Premium
                    </label>
                    <select
                      value=""
                      onChange={(e) => e.target.value !== "" && moveProblemToTopic(ti, pi, Number(e.target.value))}
                      aria-label="Move to topic"
                      className={cn(selectClass, "text-xs")}
                      disabled={topics.length < 2}
                    >
                      <option value="">Move to…</option>
                      {topics.map((t, i) => (i === ti ? null : <option key={t.id} value={i}>{t.name || `Topic ${i + 1}`}</option>))}
                    </select>
                    <div className="flex">
                      <Button type="button" variant="ghost" size="icon-sm" disabled={pi === 0} onClick={() => setTopic(ti, { problems: move(topic.problems, pi, pi - 1) })} aria-label="Move problem up">
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pi === topic.problems.length - 1}
                        onClick={() => setTopic(ti, { problems: move(topic.problems, pi, pi + 1) })}
                        aria-label="Move problem down"
                      >
                        <ArrowDown />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setTopic(ti, { problems: topic.problems.filter((_, j) => j !== pi) })} aria-label="Delete problem">
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="p-3 pt-0">
                <Button type="button" variant="ghost" size="sm" onClick={() => setTopic(ti, { problems: [...topic.problems, blankProblem()] })}>
                  <Plus /> Add problem
                </Button>
              </div>
            </section>
          ))}
          <Button type="button" variant="outline" onClick={() => update([...topics, { id: uid(), name: "", problems: [blankProblem()] }])}>
            <Plus /> Add topic
          </Button>
        </div>
      </form>

      {sheet ? (
        <form
          action={deleteSheet.bind(null, sheet.id)}
          onSubmit={(e) => {
            if (!confirm("Delete this sheet? Builders' solved problems are kept (they're shared across sheets).")) e.preventDefault();
          }}
          className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6"
        >
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 /> Delete sheet
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function ImportBox({ onImport }: { onImport: (problems: Omit<EProblem, "id">[]) => void }) {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<{ error?: string; ok?: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="rounded-xl border border-dashed p-4">
      <p className="text-sm font-medium">Import from a LeetCode list</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Pulls titles, links, difficulty and Premium flags from a public list into a new “Imported” topic. Then move problems into topics.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problem-list/…" aria-label="LeetCode list URL" className="max-w-md font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || !url}
          onClick={() =>
            start(async () => {
              const res = await importLeetCodeList(url);
              if (res.ok) {
                onImport(res.problems);
                setMsg({ ok: `Imported ${res.problems.length} problems.` });
              } else setMsg({ error: res.error });
            })
          }
        >
          <Download /> {pending ? "Importing…" : "Import"}
        </Button>
        {msg ? <span className={cn("self-center text-xs", msg.error ? "text-destructive" : "text-muted-foreground")}>{msg.error ?? msg.ok}</span> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Markdown } from "@/components/learn/markdown";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteArticle, saveArticle, type ArticleFormState } from "@/lib/learn/actions";
import { cn } from "@/lib/utils";

export type TopicOption = { id: string; name: string };

export type EditableArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  topicId: string;
  /** "on" when featured (matches the checkbox form value). */
  featured: string;
  tags: string;
  body: string;
  sourceUrl: string;
  sourceName: string;
  status: "draft" | "published";
};

const STARTER = `## Context

What system is this, who uses it, and what scale does it run at?

## The problem

What broke, or what was about to? Include numbers where you can.

## Design

\`\`\`mermaid
flowchart LR
  Client --> API[API service] --> Queue[(Queue)] --> Worker
\`\`\`

### Trade-offs

| Option | Pros | Cons |
| --- | --- | --- |
| A | ... | ... |
| B | ... | ... |

## Results

## Lessons
`;

export function ArticleEditor({
  article,
  topics,
  justCreated = false,
}: {
  article: EditableArticle | null;
  topics: TopicOption[];
  justCreated?: boolean;
}) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(
    saveArticle.bind(null, article?.id ?? null),
    justCreated ? { ok: true, message: "Draft created." } : {},
  );
  const v = state.values ?? article ?? null;
  const errors = state.fieldErrors ?? {};
  const status = state.status ?? article?.status ?? "draft";
  const slug = state.slug ?? article?.slug;

  const [body, setBody] = useState(article?.body ?? STARTER);
  const preview = useDeferredValue(body);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const draftButton = useRef<HTMLButtonElement>(null);

  // A completed save clears the dirty flag.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.ok) setDirty(false);
  }

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Ctrl/Cmd+S saves (keeps the current status).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit(draftButton.current ?? undefined);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const field = (name: keyof EditableArticle) => ({
    id: name,
    name,
    defaultValue: v?.[name as keyof typeof v] as string | undefined,
    "aria-invalid": errors[name as keyof typeof errors] ? true : undefined,
  });
  const err = (name: keyof typeof errors) =>
    errors[name]?.[0] ? <p className="text-xs text-destructive">{errors[name]?.[0]}</p> : null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <form ref={formRef} action={action} onChange={() => setDirty(true)} className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="sticky top-14 z-30 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
            <Link href="/studio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Studio
            </Link>
            <Badge variant={status === "published" ? "default" : "outline"}>
              {status === "published" ? "Published" : "Draft"}
            </Badge>
            <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {pending ? "Saving…" : dirty ? "Unsaved changes" : (state.message ?? "")}
              {state.error && !pending ? <span className="text-destructive">{state.error}</span> : null}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {status === "published" && slug ? (
                <Link href={`/learn/${slug}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  View <ExternalLink />
                </Link>
              ) : null}
              {status === "published" ? (
                <Button type="submit" name="intent" value="unpublish" variant="outline" size="sm" disabled={pending}>
                  Unpublish
                </Button>
              ) : null}
              <Button ref={draftButton} type="submit" name="intent" value="draft" variant="outline" size="sm" disabled={pending}>
                {status === "published" ? "Save" : "Save draft"}
              </Button>
              <Button type="submit" name="intent" value="publish" size="sm" disabled={pending}>
                {status === "published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
          {/* Metadata */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title" className="sr-only">
                Title
              </Label>
              <input
                {...field("title")}
                required
                maxLength={120}
                placeholder="Article title"
                className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
              />
              {err("title")}
            </div>
            <div className="space-y-1">
              <Label htmlFor="summary">Summary</Label>
              <Textarea {...field("summary")} required rows={2} maxLength={300} placeholder="One or two sentences shown on cards and in search results." />
              {err("summary")}
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                // Key forces the default to re-apply after a save echoes new values.
                key={`featured-${v?.featured ?? ""}`}
                defaultChecked={v?.featured === "on"}
                className="size-4 accent-brand"
              />
              Feature on the landing page
              <span className="text-xs text-muted-foreground">(featured articles are shown first)</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topicId">Topic</Label>
                  <Link href="/studio/topics" className="text-xs text-muted-foreground hover:text-foreground">
                    Manage topics
                  </Link>
                </div>
                <select
                  {...field("topicId")}
                  defaultValue={(v?.topicId as string | undefined) ?? topics[0]?.id ?? ""}
                  required
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {topics.length === 0 ? <option value="">Create a topic first</option> : null}
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {err("topicId")}
              </div>
              <div className="space-y-1">
                <Label htmlFor="tags">Tags</Label>
                <Input {...field("tags")} placeholder="rust, migrations, latency" />
                {err("tags")}
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug">URL slug</Label>
                <Input {...field("slug")} placeholder="from title if empty" className="font-mono" />
                {err("slug")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="sourceName">Source</Label>
                  <Input {...field("sourceName")} placeholder="Anthropic Eng." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sourceUrl">Source URL</Label>
                  <Input {...field("sourceUrl")} type="url" placeholder="https://" />
                  {err("sourceUrl")}
                </div>
              </div>
            </div>
          </div>

          {/* Write / Preview */}
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
          <div className="mt-3 grid gap-6 lg:mt-6 lg:grid-cols-2">
            <div className={cn("flex flex-col gap-1", tab !== "write" && "hidden lg:flex")}>
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>MARKDOWN</span>
                <span>```mermaid for diagrams · Ctrl/⌘+S to save</span>
              </div>
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck
                aria-invalid={errors.body ? true : undefined}
                className="min-h-[60vh] flex-1 resize-y rounded-xl border bg-muted/20 p-4 font-mono text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {err("body")}
            </div>
            <div className={cn("min-w-0 rounded-xl border p-6", tab !== "preview" && "hidden lg:block")}>
              <p className="mb-4 font-mono text-xs text-muted-foreground">PREVIEW</p>
              <Markdown>{preview}</Markdown>
            </div>
          </div>
        </div>
      </form>

      {article ? (
        <form
          action={deleteArticle.bind(null, article.id)}
          onSubmit={(e) => {
            if (!confirm("Delete this article permanently?")) e.preventDefault();
          }}
          className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6"
        >
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 /> Delete article
          </Button>
        </form>
      ) : null}
    </div>
  );
}

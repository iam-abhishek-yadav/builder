"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTopic, saveTopic, type TopicFormState } from "@/lib/learn/actions";

type EditableTopic = {
  id: string;
  name: string;
  slug: string;
  description: string;
  position: string;
  articles: number;
};

/** Create form when `topic` is null, inline edit form otherwise. */
export function TopicForm({ topic, nextPosition = 0 }: { topic: EditableTopic | null; nextPosition?: number }) {
  const [state, action, pending] = useActionState<TopicFormState, FormData>(saveTopic.bind(null, topic?.id ?? null), {});
  const [deleting, startDelete] = useTransition();
  const [deleteState, setDeleteState] = useState<TopicFormState | null>(null);
  // New-topic form clears itself after a successful add; edit forms keep the saved values.
  const v = topic ? (state.values ?? topic) : state.ok ? undefined : state.values;
  const errors = state.fieldErrors ?? {};
  const id = (name: string) => `${topic?.id ?? "new"}-${name}`;

  return (
    <form action={action} className="space-y-3 rounded-xl border p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px]">
        <div className="space-y-1">
          <Label htmlFor={id("name")}>Name</Label>
          <Input id={id("name")} name="name" required maxLength={40} defaultValue={v?.name} placeholder="Data structures & algorithms" aria-invalid={errors.name ? true : undefined} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name[0]}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor={id("slug")}>URL slug</Label>
          <Input id={id("slug")} name="slug" maxLength={80} defaultValue={v?.slug} placeholder="from name if empty" className="font-mono" aria-invalid={errors.slug ? true : undefined} />
          {errors.slug ? <p className="text-xs text-destructive">{errors.slug[0]}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor={id("position")}>Order</Label>
          <Input id={id("position")} name="position" type="number" min={0} max={10000} defaultValue={v?.position ?? String(nextPosition)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={id("description")}>Description</Label>
        <Input id={id("description")} name="description" maxLength={200} defaultValue={v?.description} placeholder="Shown under the topic tab on Learn (optional)" />
        {errors.description ? <p className="text-xs text-destructive">{errors.description[0]}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : topic ? "Save" : "Add topic"}
        </Button>
        {topic ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={deleting}
            onClick={() => {
              if (!confirm(`Delete the topic “${topic.name}”?`)) return;
              startDelete(async () => setDeleteState(await deleteTopic(topic.id)));
            }}
          >
            <Trash2 /> Delete
          </Button>
        ) : null}
        {topic ? (
          <span className="font-mono text-xs text-muted-foreground">
            {topic.articles} {topic.articles === 1 ? "article" : "articles"}
          </span>
        ) : null}
        <span className="text-xs" role="status" aria-live="polite">
          {deleteState?.error ? (
            <span className="text-destructive">{deleteState.error}</span>
          ) : state.error ? (
            <span className="text-destructive">{state.error}</span>
          ) : (
            <span className="text-muted-foreground">{state.message}</span>
          )}
        </span>
      </div>
    </form>
  );
}


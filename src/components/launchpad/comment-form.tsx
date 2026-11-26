"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/launchpad/actions";

export function CommentForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(addComment.bind(null, projectId), {});

  return (
    <form action={action} className="space-y-2">
      <Textarea
        name="body"
        // On error the draft is echoed back so the automatic form reset doesn't lose it.
        defaultValue={state.ok ? "" : state.body}
        required
        maxLength={1000}
        rows={3}
        placeholder="Share feedback, ask a question…"
        aria-label="Comment"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-destructive">{state.error}</p>
        <Button type="submit" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </form>
  );
}

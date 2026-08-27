"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/app/launchpad/actions";

export function CommentForm({ launchId }: { launchId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addCommentAction, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <input type="hidden" name="launchId" value={launchId} />
      <Textarea
        name="body"
        required
        minLength={2}
        placeholder="Ask something useful, or tell them what worked."
        className="min-h-24"
      />
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { SignInButton } from "@clerk/nextjs";
import { useOptimistic, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { useSignedIn } from "@/components/auth/use-signed-in";
import { toggleVote } from "@/lib/launchpad/actions";
import { cn } from "@/lib/utils";

type Props = {
  projectId: string;
  count: number;
  voted: boolean;
  signedIn: boolean;
  size?: "default" | "lg";
};

export function UpvoteButton({ projectId, count, voted, signedIn: serverSignedIn, size = "default" }: Props) {
  const signedIn = useSignedIn(serverSignedIn);
  const [state, flip] = useOptimistic({ count, voted }, (s) => ({
    voted: !s.voted,
    count: s.count + (s.voted ? -1 : 1),
  }));
  const [pending, startTransition] = useTransition();

  const className = cn(
    "flex shrink-0 flex-col items-center justify-center rounded-lg border font-medium tabular-nums transition-colors",
    size === "lg" ? "h-16 w-16 text-base" : "h-14 w-12 text-sm",
    state.voted
      ? "border-primary bg-primary text-primary-foreground"
      : "bg-background hover:border-foreground/40",
  );

  const content = (
    <>
      <ChevronUp className="size-4" />
      {state.count}
    </>
  );

  if (!signedIn) {
    return (
      <SignInButton mode="modal">
        <button type="button" className={className} aria-label="Sign in to upvote">
          {content}
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={state.voted}
      aria-label={state.voted ? "Remove upvote" : "Upvote"}
      disabled={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          flip(null);
          await toggleVote(projectId);
        })
      }
    >
      {content}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { toggleUpvoteAction } from "@/app/launchpad/actions";
import { cn } from "@/lib/utils";

const shellClass =
  "inline-flex h-[4.25rem] min-w-[3.15rem] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-1.5 text-sm font-semibold tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function UpvoteButton({
  launchId,
  count,
  voted,
  signedIn,
  disabled,
}: {
  launchId: string;
  count: number;
  voted: boolean;
  signedIn: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const tone = voted
    ? "border-transparent bg-[#0b1c30] text-white"
    : "border-border bg-background text-foreground hover:bg-muted";

  const body = (
    <>
      <ChevronUp className="size-4" strokeWidth={2.4} />
      <span>{count}</span>
    </>
  );

  if (!signedIn) {
    return (
      <a
        href={`/sign-in?redirect_url=${encodeURIComponent(`/launchpad/${launchId}`)}`}
        className={cn(shellClass, tone)}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || pending}
      className={cn(
        shellClass,
        tone,
        "disabled:pointer-events-none disabled:opacity-50",
      )}
      onClick={() => {
        startTransition(async () => {
          await toggleUpvoteAction(launchId);
          router.refresh();
        });
      }}
    >
      {body}
    </button>
  );
}

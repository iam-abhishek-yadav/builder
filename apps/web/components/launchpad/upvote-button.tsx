"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleUpvoteAction } from "@/app/launchpad/actions";
import { cn } from "@/lib/utils";

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

  if (!signedIn) {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-auto min-w-14 flex-col gap-0 px-2 py-2"
        nativeButton={false}
        render={
          <a
            href={`/sign-in?redirect_url=${encodeURIComponent(`/launchpad/${launchId}`)}`}
          />
        }
      >
        <ChevronUp className="size-4" />
        <span className="text-sm font-semibold tabular-nums">{count}</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={voted ? "default" : "outline"}
      disabled={disabled || pending}
      className={cn(
        "h-auto min-w-14 flex-col gap-0 px-2 py-2",
        voted && "border-primary",
      )}
      onClick={() => {
        startTransition(async () => {
          await toggleUpvoteAction(launchId);
          router.refresh();
        });
      }}
    >
      <ChevronUp className="size-4" />
      <span className="text-sm font-semibold tabular-nums">{count}</span>
    </Button>
  );
}

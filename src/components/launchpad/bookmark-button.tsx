"use client";

import { SignInButton } from "@clerk/nextjs";
import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useSignedIn } from "@/components/auth/use-signed-in";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/launchpad/actions";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  projectId,
  bookmarked,
  signedIn: serverSignedIn,
}: {
  projectId: string;
  bookmarked: boolean;
  signedIn: boolean;
}) {
  const signedIn = useSignedIn(serverSignedIn);
  const [active, flip] = useOptimistic(bookmarked, (s) => !s);
  const [pending, startTransition] = useTransition();
  const icon = <Bookmark className={cn(active && "fill-current")} />;

  if (!signedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant="outline">{icon} Save</Button>
      </SignInButton>
    );
  }

  return (
    <Button
      variant="outline"
      aria-pressed={active}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          flip(null);
          await toggleBookmark(projectId);
        })
      }
    >
      {icon} {active ? "Saved" : "Save"}
    </Button>
  );
}

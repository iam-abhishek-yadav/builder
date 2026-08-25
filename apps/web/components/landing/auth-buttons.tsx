"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/sign-in" />}
          className="text-muted-foreground"
        >
          Log in
        </Button>
        <Button nativeButton={false} render={<Link href="/sign-up" />}>
          Get started
        </Button>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "size-9",
            },
          }}
        />
      </Show>
    </div>
  );
}

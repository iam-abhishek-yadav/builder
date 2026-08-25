"use client";

import Link from "next/link";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { profileHref } from "@/lib/profile-path";

export function AuthButtons() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const profileUrl = email ? profileHref(email) : "/profile";

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
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href={profileUrl} />}
          className="text-muted-foreground"
        >
          Profile
        </Button>
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

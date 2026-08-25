"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function HeroCtas() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Show when="signed-out">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/sign-up" />}
          className="h-12 px-7 text-sm"
        >
          Create your profile
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/#features" />}
          className="h-12 border-white/25 bg-transparent px-7 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          Explore the platform
        </Button>
      </Show>
      <Show when="signed-in">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/profile" />}
          className="h-12 px-7 text-sm"
        >
          Your profile
        </Button>
      </Show>
    </div>
  );
}

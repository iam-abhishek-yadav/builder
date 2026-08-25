"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-primary px-4 py-16 text-primary-foreground sm:px-8 md:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Start with a profile. The rest follows.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-primary-foreground/80">
            Same account whether you are shipping your first project or hiring
            for the next one.
          </p>
        </div>
        <Show when="signed-out">
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="h-12 px-8 text-sm"
          >
            Get started
          </Button>
        </Show>
        <Show when="signed-in">
          <p className="text-sm font-medium text-primary-foreground/80">
            You&apos;re signed in. Features roll out next.
          </p>
        </Show>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border/60 bg-background/90 backdrop-blur-md md:h-20">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[2rem] md:leading-10"
          >
            Builder
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/#how-it-works"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              How it works
            </Link>
            <Link
              href="/outreach"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Outreach
            </Link>
            <Link
              href="/resume-builder"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Resume
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Show when="signed-out">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/sign-in" />}
              className="text-muted-foreground"
            >
              Log in
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/sign-up" />}
              className="ambient-shadow"
            >
              Get Started
            </Button>
          </Show>
          <Show when="signed-in">
            <Button
              nativeButton={false}
              render={<Link href="/outreach" />}
              variant="ghost"
              className="hidden text-muted-foreground sm:inline-flex"
            >
              Open Hub
            </Button>
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/profile-creation", label: "Profile", key: "profile" },
  { href: "/resume-builder", label: "Resume", key: "resume" },
] as const;

export function CreatorHubHeader({
  active,
  trailing,
}: {
  active: "profile" | "resume";
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border/60 bg-background/90 backdrop-blur-md sm:h-20">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="font-display shrink-0 text-2xl font-bold tracking-tight text-foreground md:text-[2rem] md:leading-10"
          >
            Builder
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active === item.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {trailing ? (
            <div className="hidden items-center gap-2 sm:flex">{trailing}</div>
          ) : null}
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-9",
              },
            }}
          />
        </div>
      </nav>
    </header>
  );
}

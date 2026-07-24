"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/profile-creation", label: "Profile", key: "profile", icon: User },
  { href: "/resume-builder", label: "Resume", key: "resume", icon: FileText },
] as const;

export function CreatorHubSidebar({
  active,
}: {
  active: "profile" | "resume";
}) {
  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-64 flex-col border-r border-border bg-muted py-8 md:flex">
      <div className="mb-10 px-6">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground"
        >
          Creator Hub
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your presence
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Home className="size-5" />
          Home
        </Link>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? item.key === "resume"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function CreatorHubTopBar({
  active,
  title,
  trailing,
}: {
  active: "profile" | "resume";
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:h-20 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground md:hidden"
        >
          Builder
        </Link>
        <h1 className="font-display hidden truncate text-xl font-semibold md:block md:text-2xl">
          {title}
        </h1>
      </div>

      <nav className="flex items-center gap-1 md:hidden">
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
      </nav>

      <div className="hidden items-center gap-2 md:flex">{trailing}</div>
    </header>
  );
}

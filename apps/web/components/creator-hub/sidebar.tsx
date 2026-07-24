"use client";

import Link from "next/link";
import { FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
          href="/profile-creation"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
            active === "profile"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <User className="size-5" />
          Profile
        </Link>
        <Link
          href="/resume-builder"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
            active === "resume"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <FileText className="size-5" />
          Resume
        </Link>
      </nav>
    </aside>
  );
}

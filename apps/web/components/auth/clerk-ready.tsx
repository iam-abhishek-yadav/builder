"use client";

import type { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function ClerkReady({ children }: { children: ReactNode }) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="font-display text-3xl font-bold tracking-tight text-foreground">
          Builder
        </p>
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Getting things ready…</p>
      </div>
    );
  }

  return children;
}

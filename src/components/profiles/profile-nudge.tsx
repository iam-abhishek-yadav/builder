"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { Container } from "@/components/container";

const KEY = "profile-nudge-dismissed";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getDismissed = () => localStorage.getItem(KEY) === "1";

/** Suggests picking a username. Rendered only for signed-in builders without a handle. */
export function ProfileNudge() {
  const pathname = usePathname();
  // Server render and first paint assume "dismissed" to avoid flashing the banner.
  const dismissed = useSyncExternalStore(subscribe, getDismissed, () => true);
  if (dismissed || pathname.startsWith("/settings")) return null;

  return (
    <div className="border-b bg-muted/50">
      <Container className="flex items-center gap-3 py-2 text-sm">
        <p className="min-w-0 flex-1">
          <span className="font-medium">Claim your profile URL.</span>{" "}
          <span className="text-muted-foreground">Pick a username so people can find your launches.</span>
        </p>
        <Link href="/settings/profile" className="shrink-0 font-medium underline underline-offset-4 hover:text-brand">
          Pick a username
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            listeners.forEach((l) => l());
          }}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </Container>
    </div>
  );
}

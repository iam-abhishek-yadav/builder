"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AUTH_WARM_KEY } from "@/components/auth/auth-warm";

function subscribe() {
  return () => {};
}

function getWarmSnapshot() {
  return sessionStorage.getItem(AUTH_WARM_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const warmed = useSyncExternalStore(subscribe, getWarmSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(warmed);

  useEffect(() => {
    if (warmed) {
      setReady(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const isReady = () => Boolean(root.querySelector("input, select, textarea"));

    if (isReady()) {
      setReady(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (isReady()) {
        setReady(true);
        observer.disconnect();
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [warmed]);

  return (
    <div ref={rootRef} className="min-h-dvh">
      {children}
      {ready ? null : (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"
          aria-busy="true"
          aria-live="polite"
        >
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            Builder
          </p>
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Getting things ready…</p>
        </div>
      )}
    </div>
  );
}

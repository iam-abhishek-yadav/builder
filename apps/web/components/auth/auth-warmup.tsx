"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Show, SignIn } from "@clerk/nextjs";
import { AUTH_WARM_KEY } from "@/components/auth/auth-warm";

export function AuthWarmup() {
  return (
    <Show when="signed-out">
      <AuthWarmupInner />
    </Show>
  );
}

function AuthWarmupInner() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch("/sign-in");
    router.prefetch("/sign-up");
  }, [router]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const markReady = () => {
      if (!root.querySelector("input, select, textarea")) return false;
      sessionStorage.setItem(AUTH_WARM_KEY, "1");
      return true;
    };

    if (markReady()) return;

    const observer = new MutationObserver(() => {
      if (markReady()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed top-0 left-0 -z-50 h-[720px] w-[400px] -translate-x-full overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <SignIn />
    </div>
  );
}

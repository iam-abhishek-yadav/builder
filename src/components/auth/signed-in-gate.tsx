"use client";

import type { ReactNode } from "react";
import { useSignedIn } from "./use-signed-in";

/** Renders `children` when signed in, `fallback` otherwise, switching instantly on auth changes. */
export function SignedInGate({
  serverSignedIn,
  children,
  fallback = null,
}: {
  serverSignedIn: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useSignedIn(serverSignedIn) ? children : fallback;
}

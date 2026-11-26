"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Signed-in state that reacts instantly to sign-in / sign-out.
 *
 * `serverHint` is what the server saw when it rendered. It is used until Clerk
 * loads in the browser, so the first paint matches the server HTML (no flicker).
 * After that, Clerk's client state wins, so the UI flips immediately instead of
 * waiting for the router.refresh() round trip Clerk triggers after auth changes.
 */
export function useSignedIn(serverHint: boolean) {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded ? Boolean(isSignedIn) : serverHint;
}

"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Bookmark, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SYNC_TIMEOUT_MS = 10_000;

export function HeaderAuth({ serverSignedIn }: { serverSignedIn: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  // Server's answer until Clerk loads (matches the HTML), Clerk's live state after.
  const signedIn = isLoaded ? Boolean(isSignedIn) : serverSignedIn;
  // Clerk already switched, but the server-rendered page (refreshed by Clerk via
  // router.refresh()) hasn't caught up yet.
  const syncing = isLoaded && signedIn !== serverSignedIn;

  return (
    <>
      {signedIn ? (
        // Fixed size so the avatar slot doesn't shift while Clerk's button mounts.
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link label="Bookmarks" labelIcon={<Bookmark className="size-4" />} href="/bookmarks" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      ) : (
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </SignInButton>
      )}
      {syncing ? <AuthSyncNotice signingIn={signedIn} /> : null}
    </>
  );
}

function AuthSyncNotice({ signingIn }: { signingIn: boolean }) {
  // Safety net: if the refresh never lands (e.g. network error), don't spin forever.
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExpired(true), SYNC_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);
  if (expired) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm shadow-md fade-in slide-in-from-top-2"
    >
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
      {signingIn ? "Signing you in…" : "Signing you out…"}
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { HeaderAuth } from "@/components/auth/header-auth";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { NavLinks, NavLinksStatic } from "@/components/nav-links";
import { ProfileNudge } from "@/components/profiles/profile-nudge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/session";

function Nav({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Main">
      <Suspense fallback={<NavLinksStatic />}>
        <NavLinks />
      </Suspense>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-6">
        <Logo />
        {/* Desktop: nav inline. Mobile: nav gets its own row below so actions always fit. */}
        <Nav className="hidden items-center gap-0.5 sm:flex" />
        <div className="ml-auto flex items-center gap-2">
          <Link href="/launch" className={buttonVariants({ size: "sm" })}>
            Launch
          </Link>
          {/* Reading auth needs request data, so it sits behind Suspense (Cache Components). */}
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <HeaderAuthServer />
          </Suspense>
        </div>
      </Container>
      <Container className="-mt-1 flex h-10 items-center sm:hidden">
        <Nav className="-ml-2.5 flex items-center gap-0.5" />
      </Container>
      <Suspense>
        <NudgeServer />
      </Suspense>
    </header>
  );
}

/** Shows the "pick a username" nudge to signed-in builders who haven't chosen one. */
async function NudgeServer() {
  const { userId } = await auth();
  if (!userId) return null;
  const me = await getCurrentUser();
  return me && !me.handle ? <ProfileNudge /> : null;
}

async function HeaderAuthServer() {
  const { userId } = await auth();
  return <HeaderAuth serverSignedIn={Boolean(userId)} />;
}
